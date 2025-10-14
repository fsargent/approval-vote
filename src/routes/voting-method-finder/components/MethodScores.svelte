<script lang="ts">
  type Scores = {
    proportionality: number;
    simplicity: number;
    honestStrategyResistance: number;
    strategicStraightforwardness: number;
    representation: number;
  };

  export let scores: Scores;
  export let activeTooltip: string | null = null;
  export let onToggle: (id: string) => void;
</script>

<div class="method-scores">
  <h3>System Analysis</h3>
  <div class="score-grid">
    <div class="score-item">
      <div class="score-bar-container">
        <div class="score-label-container">
          <button type="button" class="score-label clickable" onclick={() => onToggle('proportionality')}>Proportionality</button>
        </div>
        <div class="score-bar">
          <div class="score-fill" data-score={scores.proportionality} style={`width: ${(scores.proportionality/5)*100}%`}></div>
          <span class="score-value">{scores.proportionality}/5</span>
        </div>
      </div>
      {#if activeTooltip === 'proportionality'}
        <div class="info-panel">How well the election results reflect the proportion of support for different groups or parties - higher scores mean seats are allocated more fairly based on vote share</div>
      {/if}
    </div>

    <div class="score-item">
      <div class="score-bar-container">
        <div class="score-label-container">
          <button type="button" class="score-label clickable" onclick={() => onToggle('simplicity')}>Voter Simplicity</button>
        </div>
        <div class="score-bar">
          <div class="score-fill" data-score={scores.simplicity} style={`width: ${(scores.simplicity/5)*100}%`}></div>
          <span class="score-value">{scores.simplicity}/5</span>
        </div>
      </div>
      {#if activeTooltip === 'simplicity'}
        <div class="info-panel">How easy it is for voters to understand and use the voting method - considers ballot complexity, cognitive load, and learning curve</div>
      {/if}
    </div>

    <div class="score-item">
      <div class="score-bar-container">
        <div class="score-label-container">
          <button type="button" class="score-label clickable" onclick={() => onToggle('honest-resistance')}>Honest Strategy Resistance</button>
        </div>
        <div class="score-bar">
          <div class="score-fill" data-score={scores.honestStrategyResistance} style={`width: ${(scores.honestStrategyResistance/5)*100}%`}></div>
          <span class="score-value">{scores.honestStrategyResistance}/5</span>
        </div>
      </div>
      {#if activeTooltip === 'honest-resistance'}
        <div class="info-panel">How well the method resists dishonest strategies where you support a less-preferred candidate more than a preferred one - higher scores mean less incentive for tactical voting</div>
      {/if}
    </div>

    <div class="score-item">
      <div class="score-bar-container">
        <div class="score-label-container">
          <button type="button" class="score-label clickable" onclick={() => onToggle('quality')}>Representation Quality</button>
        </div>
        <div class="score-bar">
          <div class="score-fill" data-score={scores.representation} style={`width: ${(scores.representation/5)*100}%`}></div>
          <span class="score-value">{scores.representation}/5</span>
        </div>
      </div>
      {#if activeTooltip === 'quality'}
        <div class="info-panel">How well the elected candidates actually represent the preferences and will of the electorate - considers broad support, minority representation, and whether outcomes reflect voter intent</div>
      {/if}
    </div>

    <div class="score-item">
      <div class="score-bar-container">
        <div class="score-label-container">
          <button type="button" class="score-label clickable" onclick={() => onToggle('straightforwardness')}>Strategic Straightforwardness</button>
        </div>
        <div class="score-bar">
          <div class="score-fill" data-score={scores.strategicStraightforwardness} style={`width: ${(scores.strategicStraightforwardness/5)*100}%`}></div>
          <span class="score-value">{scores.strategicStraightforwardness}/5</span>
        </div>
      </div>
      {#if activeTooltip === 'straightforwardness'}
        <div class="info-panel">How easy it is to vote your true preferences without needing to consider strategy or candidate viability - higher scores mean less mental burden on voters</div>
      {/if}
    </div>
  </div>
</div>

<style>
  .method-scores { background: #f1f5f9; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #0ea5e9; margin-bottom: 1.5rem; }
  .method-scores h3 { margin-top: 0; color: #0ea5e9; margin-bottom: 1rem; font-size: 1.2rem; }
  .score-grid { display: grid; gap: 1rem; }
  .score-item { display: flex; flex-direction: column; gap: 0.5rem; }
  .score-label-container { display: flex; align-items: center; gap: 0.5rem; width: 200px; flex-shrink: 0; }
  .score-label { font-weight: 500; color: #475569; font-size: 0.95rem; background: none; border: none; padding: 0; text-align: left; font-family: inherit; }
  .score-label.clickable { cursor: help; user-select: none; border-bottom: 1px dashed #94a3b8; padding-bottom: 1px; }
  .score-bar-container { display: flex; align-items: center; gap: 1rem; }
  .score-bar { flex: 1; height: 24px; background: #e2e8f0; border-radius: 12px; position: relative; overflow: hidden; }
  .score-fill { height: 100%; border-radius: 12px; transition: all 0.3s ease; }
  :global(.score-fill[data-score='0']) { background: #ef4444; }
  :global(.score-fill[data-score='1']) { background: #f97316; }
  :global(.score-fill[data-score='2']) { background: #f59e0b; }
  :global(.score-fill[data-score='3']) { background: #eab308; }
  :global(.score-fill[data-score='4']) { background: #84cc16; }
  :global(.score-fill[data-score='5']) { background: #10b981; }
  .score-value { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); font-size: 0.875rem; font-weight: 600; color: #1e293b; }
  .info-panel { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0.75rem; font-size: 0.875rem; line-height: 1.4; color: #475569; margin-top: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
</style>


