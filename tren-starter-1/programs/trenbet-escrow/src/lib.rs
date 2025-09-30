use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkgCzY7QzUo6M"); // Change after deploy

#[program]
pub mod trenbet_escrow {
    use super::*;

    pub fn create_match(ctx: Context<CreateMatch>, amount: u64) -> Result<()> {
        // Player 1 deposits tokens into escrow
        token::transfer(
            ctx.accounts.into_transfer_to_escrow_ctx_player1(),
            amount,
        )?;

        let match_state = &mut ctx.accounts.match_state;
        match_state.player1 = ctx.accounts.player1.key();
        match_state.player2 = Pubkey::default();
        match_state.amount = amount;
        match_state.state = 1; // 1 = waiting for opponent
        Ok(())
    }

    pub fn join_match(ctx: Context<JoinMatch>) -> Result<()> {
        let amount = ctx.accounts.match_state.amount;

        // Player 2 deposits tokens into escrow
        token::transfer(
            ctx.accounts.into_transfer_to_escrow_ctx_player2(),
            amount,
        )?;

        let match_state = &mut ctx.accounts.match_state;
        match_state.player2 = ctx.accounts.player2.key();
        match_state.state = 2; // 2 = ready to play
        Ok(())
    }

    pub fn resolve_match(
        ctx: Context<ResolveMatch>,
        winner: Pubkey,     // Winner public key
        fee_bps: u16,       // Fee in basis points (e.g., 700 for 7%)
    ) -> Result<()> {
        require!(ctx.accounts.match_state.state == 2, CustomError::MatchNotReady);

        let amount = ctx.accounts.match_state.amount;
        let total = amount.checked_mul(2).unwrap();
        let fee = total.checked_mul(fee_bps as u64).unwrap() / 10000;
        let payout = total.checked_sub(fee).unwrap();

        // Payout to winner from escrow
        let winner_token = if ctx.accounts.player1.key() == winner {
            &ctx.accounts.player1_token
        } else if ctx.accounts.player2.key() == winner {
            &ctx.accounts.player2_token
        } else {
            return Err(error!(CustomError::InvalidWinner));
        };

        token::transfer(
            ctx.accounts.into_transfer_to_winner_ctx(winner_token),
            payout,
        )?;
        // Fee to platform
        token::transfer(
            ctx.accounts.into_transfer_to_fee_ctx(),
            fee,
        )?;

        ctx.accounts.match_state.state = 3; // 3 = resolved
        Ok(())
    }
}

// -------------------- CPI Context Builders --------------------

impl<'info> CreateMatch<'info> {
    pub fn into_transfer_to_escrow_ctx_player1(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info().clone(),
            Transfer {
                from: self.player1_token.to_account_info().clone(),
                to: self.escrow_token.to_account_info().clone(),
                authority: self.player1.to_account_info().clone(),
            },
        )
    }
}

impl<'info> JoinMatch<'info> {
    pub fn into_transfer_to_escrow_ctx_player2(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info().clone(),
            Transfer {
                from: self.player2_token.to_account_info().clone(),
                to: self.escrow_token.to_account_info().clone(),
                authority: self.player2.to_account_info().clone(),
            },
        )
    }
}

impl<'info> ResolveMatch<'info> {
    pub fn into_transfer_to_winner_ctx(&self, winner_token: &Account<'info, TokenAccount>) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info().clone(),
            Transfer {
                from: self.escrow_token.to_account_info().clone(),
                to: winner_token.to_account_info().clone(),
                authority: self.admin.to_account_info().clone(), // You may want escrow PDA here instead!
            },
        )
    }

    pub fn into_transfer_to_fee_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info().clone(),
            Transfer {
                from: self.escrow_token.to_account_info().clone(),
                to: self.fee_wallet.to_account_info().clone(),
                authority: self.admin.to_account_info().clone(), // You may want escrow PDA here too!
            },
        )
    }
}

// -------------------- Account Structs --------------------

#[derive(Accounts)]
pub struct CreateMatch<'info> {
    #[account(mut)]
    pub player1: Signer<'info>,
    pub mint: Box<Account<'info, Mint>>,
    #[account(
        init,
        payer = player1,
        space = 8 + 32 + 32 + 8 + 1,
        seeds = [b"match", player1.key().as_ref(), mint.key().as_ref()],
        bump,
    )]
    pub match_state: Account<'info, MatchState>,
    #[account(mut)]
    pub player1_token: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub escrow_token: Box<Account<'info, TokenAccount>>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct JoinMatch<'info> {
    #[account(mut)]
    pub player2: Signer<'info>,
    pub mint: Box<Account<'info, Mint>>,
    #[account(mut)]
    pub match_state: Account<'info, MatchState>,
    #[account(mut)]
    pub player2_token: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub escrow_token: Box<Account<'info, TokenAccount>>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ResolveMatch<'info> {
    #[account(mut)]
    pub admin: Signer<'info>, // Only admin can resolve
    #[account(mut)]
    pub match_state: Account<'info, MatchState>,
    /// CHECK: These are safe because they're only used for pubkey comparison
    #[account(mut)]
    pub player1: SystemAccount<'info>,
    #[account(mut)]
    pub player2: SystemAccount<'info>,
    #[account(mut)]
    pub player1_token: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub player2_token: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub escrow_token: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub fee_wallet: Box<Account<'info, TokenAccount>>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct MatchState {
    pub player1: Pubkey,
    pub player2: Pubkey,
    pub amount: u64,
    pub state: u8, // 1: open, 2: ready, 3: resolved
}

#[error_code]
pub enum CustomError {
    #[msg("Match not ready.")]
    MatchNotReady,
    #[msg("Invalid winner.")]
    InvalidWinner,
}


