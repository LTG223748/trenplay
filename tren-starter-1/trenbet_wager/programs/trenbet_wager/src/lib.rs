use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg3VbHSvZn1N"); // You'll replace this later after deploying

#[program]
pub mod trenbet_wager {
    use super::*;

    pub fn initialize_match(
        ctx: Context<InitializeMatch>,
        wager_amount: u64,
    ) -> Result<()> {
        let match_state = &mut ctx.accounts.match_state;
        match_state.creator = *ctx.accounts.creator.key;
        match_state.wager_amount = wager_amount;
        match_state.status = MatchStatus::Pending;
        Ok(())
    }

    pub fn submit_winner(
        ctx: Context<SubmitWinner>,
        result: String,
    ) -> Result<()> {
        let match_state = &mut ctx.accounts.match_state;
        let player = ctx.accounts.player.key();

        if player == match_state.creator {
            match_state.creator_result = Some(result);
        } else if player == match_state.joiner {
            match_state.joiner_result = Some(result);
        } else {
            return Err(error!(ErrorCode::Unauthorized));
        }

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeMatch<'info> {
    #[account(init, payer = creator, space = 8 + 64)]
    pub match_state: Account<'info, MatchState>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubmitWinner<'info> {
    #[account(mut)]
    pub match_state: Account<'info, MatchState>,
    pub player: Signer<'info>,
}

#[account]
pub struct MatchState {
    pub creator: Pubkey,
    pub joiner: Pubkey,
    pub wager_amount: u64,
    pub creator_result: Option<String>,
    pub joiner_result: Option<String>,
    pub status: MatchStatus,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum MatchStatus {
    Pending,
    Completed,
    Disputed,
    Void,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized player")]
    Unauthorized,
}
