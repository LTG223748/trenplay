use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, Transfer};

declare_id!("Bfhtc2k1BgeuAYVPRH7enY7DYpQgPR2N3gxB3unY9c2y"); // Use your real program ID after deploy

#[program]
pub mod trenbet_tournament {
    use super::*;

    pub fn init_tournament(
        ctx: Context<InitTournament>,
        entry_fee: u64,
        max_players: u8,
    ) -> Result<()> {
        let t = &mut ctx.accounts.tournament;
        t.organizer = ctx.accounts.organizer.key();
        t.entry_fee = entry_fee;
        t.max_players = max_players;
        t.players = Vec::new();
        t.prize_pool = 0;
        t.state = 0; // 0: Open, 1: Started, 2: Complete
        Ok(())
    }

    pub fn join_tournament(ctx: Context<JoinTournament>) -> Result<()> {
        require!(ctx.accounts.tournament.state == 0, TournamentError::NotOpen);
        require!(
            (ctx.accounts.tournament.players.len() as u8) < ctx.accounts.tournament.max_players,
            TournamentError::Full
        );

        // Transfer entry fee before mutable borrow
        token::transfer(
            ctx.accounts.into_transfer_to_escrow(),
            ctx.accounts.tournament.entry_fee,
        )?;

        let t = &mut ctx.accounts.tournament;
        t.players.push(ctx.accounts.player.key());
        t.prize_pool = t.prize_pool.checked_add(t.entry_fee).unwrap();
        Ok(())
    }

    pub fn payout_winner(ctx: Context<PayoutWinner>) -> Result<()> {
        require!(
            ctx.accounts.tournament.state == 1,
            TournamentError::NotStarted
        );
        require!(
            ctx.accounts.tournament.players.contains(&ctx.accounts.winner.key()),
            TournamentError::NotAPlayer
        );

        // Transfer prize pool before mutable borrow
        token::transfer(
            ctx.accounts.into_transfer_to_winner(),
            ctx.accounts.tournament.prize_pool,
        )?;

        let t = &mut ctx.accounts.tournament;
        t.state = 2; // Complete
        Ok(())
    }
}

// ----------- Context Builders ------------

impl<'info> JoinTournament<'info> {
    pub fn into_transfer_to_escrow(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info().clone(),
            Transfer {
                from: self.player_token.to_account_info().clone(),
                to: self.escrow.to_account_info().clone(),
                authority: self.player.to_account_info().clone(),
            },
        )
    }
}

impl<'info> PayoutWinner<'info> {
    pub fn into_transfer_to_winner(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info().clone(),
            Transfer {
                from: self.escrow.to_account_info().clone(),
                to: self.winner_token.to_account_info().clone(),
                authority: self.tournament.to_account_info().clone(), // You may want to use a PDA for true authority!
            },
        )
    }
}

// ------------- Account Structs ------------

#[derive(Accounts)]
pub struct InitTournament<'info> {
    #[account(mut)]
    pub organizer: Signer<'info>,
    #[account(
        init,
        payer = organizer,
        space = 8 + 32 + 8 + 1 + (32 * 64) + 8 + 1, // Estimate, adjust if needed
        seeds = [b"tournament", organizer.key().as_ref(), mint.key().as_ref()],
        bump,
    )]
    pub tournament: Account<'info, TournamentAccount>,
    pub mint: Box<Account<'info, Mint>>,
    #[account(
        mut,
        seeds = [b"escrow", tournament.key().as_ref()],
        bump,
    )]
    pub escrow: Box<Account<'info, TokenAccount>>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct JoinTournament<'info> {
    #[account(mut)]
    pub player: Signer<'info>,
    #[account(mut)]
    pub tournament: Account<'info, TournamentAccount>,
    #[account(mut)]
    pub player_token: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub escrow: Box<Account<'info, TokenAccount>>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct PayoutWinner<'info> {
    #[account(mut)]
    pub tournament: Account<'info, TournamentAccount>,
    #[account(mut)]
    pub winner: Signer<'info>,
    #[account(mut)]
    pub escrow: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub winner_token: Box<Account<'info, TokenAccount>>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct TournamentAccount {
    pub organizer: Pubkey,
    pub entry_fee: u64,
    pub max_players: u8,
    pub players: Vec<Pubkey>,
    pub prize_pool: u64,
    pub state: u8, // 0=open, 1=started, 2=complete
}

#[error_code]
pub enum TournamentError {
    #[msg("Tournament not open for joining.")]
    NotOpen,
    #[msg("Tournament is full.")]
    Full,
    #[msg("Tournament not started.")]
    NotStarted,
    #[msg("Not a player in this tournament.")]
    NotAPlayer,
}


