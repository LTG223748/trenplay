use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint};

declare_id!("APTTwztgAyNriW7JV4VwPugTouwRexf7KHb6foJ7JY9N");

#[program]
pub mod trenbet_subscription {
    use super::*;

    pub fn subscribe(ctx: Context<Subscribe>, months: u8) -> Result<()> {
        require!(months > 0, SubErr::ZeroMonths);

        // ---- price & payment (14.99 TC / month, 9 decimals) ----
        let price_per_month: u64 = 14_990_000_000;
        let total_price = price_per_month
            .checked_mul(months as u64)
            .ok_or(SubErr::MathOverflow)?;

        token::transfer(ctx.accounts.transfer_to_vault_ctx(), total_price)?;

        // ---- extend expiry (stack with existing) ----
        let now = Clock::get()?.unix_timestamp;
        let duration = (months as i64)
            .checked_mul(30 * 24 * 60 * 60) // 30 days
            .ok_or(SubErr::MathOverflow)?;

        let sub = &mut ctx.accounts.subscription;
        let base = std::cmp::max(sub.expiry, now);
        sub.expiry = base.checked_add(duration).ok_or(SubErr::MathOverflow)?;
        sub.owner = ctx.accounts.payer.key();

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Subscribe<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    // One PDA per (payer, mint). Use init_if_needed so renewals work.
    #[account(
        init_if_needed,
        payer = payer,
        space = 8 + SubscriptionAccount::LEN,
        seeds = [b"sub", payer.key().as_ref(), mint.key().as_ref()],
        bump
    )]
    pub subscription: Account<'info, SubscriptionAccount>,

    // Payer’s token account (must be for this mint and owned by payer)
    #[account(
        mut,
        constraint = payer_token.owner == payer.key(),
        constraint = payer_token.mint == mint.key(),
    )]
    pub payer_token: Box<Account<'info, TokenAccount>>,

    // Vault token account (admin’s ATA or any receiver; must match mint)
    #[account(
        mut,
        constraint = vault_token.mint == mint.key(),
    )]
    pub vault_token: Box<Account<'info, TokenAccount>>,

    pub mint: Box<Account<'info, Mint>>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

impl<'info> Subscribe<'info> {
    pub fn transfer_to_vault_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.payer_token.to_account_info(),
                to: self.vault_token.to_account_info(),
                authority: self.payer.to_account_info(),
            },
        )
    }
}

#[account]
pub struct SubscriptionAccount {
    pub owner: Pubkey,
    pub expiry: i64, // unix timestamp
}
impl SubscriptionAccount {
    pub const LEN: usize = 32 + 8;
}

#[error_code]
pub enum SubErr {
    #[msg("Months must be greater than 0")]
    ZeroMonths,
    #[msg("Math overflow")]
    MathOverflow,
}
