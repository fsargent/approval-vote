<script lang="ts">
  import type { VotingMethod } from '$lib/types/voting';

  interface Props {
    visible: boolean;
    methods: string[];
    methodData: Record<string, VotingMethod>;
    currentId: string | null;
    onClose: () => void;
    onSwitch: (id: string) => void;
  }

  let { visible, methods, methodData, currentId, onClose, onSwitch }: Props = $props();
</script>

{#if visible}
  <div class="comparison-overlay" role="button" tabindex="0" onclick={onClose} onkeydown={(e) => e.key === 'Escape' && onClose()}>
    <div class="comparison-modal" role="dialog" tabindex="-1" aria-labelledby="comparison-title" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
      <div class="comparison-header">
        <h2 id="comparison-title">Method Comparison</h2>
        <button class="close-button" onclick={onClose}>×</button>
      </div>
      <div class="comparison-content">
        <div class="comparison-grid">
          {#each methods as methodId}
            <div class="comparison-card" class:current={methodId === currentId}>
              <div class="card-header">
                <h3>{methodData[methodId].name}</h3>
                {#if methodId === currentId}
                  <span class="current-badge">Current</span>
                {/if}
              </div>

              <div class="method-summary-compact">
                <p><strong>What it does:</strong> {methodData[methodId].shortDescription}</p>
              </div>

              <div class="score-comparison">
                <div class="score-row">
                  <span class="score-name">Proportionality</span>
                  <div class="score-bar-small"><div class="score-fill-small" style={`width: ${(methodData[methodId].scores.proportionality/5)*100}%`}></div></div>
                  <span class="score-num">{methodData[methodId].scores.proportionality}/5</span>
                </div>
                <div class="score-row">
                  <span class="score-name">Simplicity</span>
                  <div class="score-bar-small"><div class="score-fill-small" style={`width: ${(methodData[methodId].scores.simplicity/5)*100}%`}></div></div>
                  <span class="score-num">{methodData[methodId].scores.simplicity}/5</span>
                </div>
                <div class="score-row">
                  <span class="score-name">Honest Strategy</span>
                  <div class="score-bar-small"><div class="score-fill-small" style={`width: ${(methodData[methodId].scores.honestStrategyResistance/5)*100}%`}></div></div>
                  <span class="score-num">{methodData[methodId].scores.honestStrategyResistance}/5</span>
                </div>
                <div class="score-row">
                  <span class="score-name">Straightforward</span>
                  <div class="score-bar-small"><div class="score-fill-small" style={`width: ${(methodData[methodId].scores.strategicStraightforwardness/5)*100}%`}></div></div>
                  <span class="score-num">{methodData[methodId].scores.strategicStraightforwardness}/5</span>
                </div>
                <div class="score-row">
                  <span class="score-name">Representation</span>
                  <div class="score-bar-small"><div class="score-fill-small" style={`width: ${(methodData[methodId].scores.representation/5)*100}%`}></div></div>
                  <span class="score-num">{methodData[methodId].scores.representation}/5</span>
                </div>
              </div>

              <div class="method-details">
                <p><strong>Key Trade-offs:</strong> {methodData[methodId].detailedCritique.split('.')[0]}.</p>
              </div>

              {#if methodData[methodId].votingMachineCompatibility}
                <div class="compatibility-compact">
                  <span class="compatibility-label">Voting Machines:</span>
                  <span class="compatibility-value" class:compatible={methodData[methodId].votingMachineCompatibility.existingMachines} class:incompatible={!methodData[methodId].votingMachineCompatibility.existingMachines}>
                    {methodData[methodId].votingMachineCompatibility.existingMachines ? 'Compatible' : 'Requires New Machines'}
                  </span>
                </div>
              {/if}

              {#if methodId !== currentId}
                <button class="switch-method-button" onclick={() => onSwitch(methodId)}>Switch to this method</button>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .comparison-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
  .comparison-modal { background: white; border-radius: 12px; max-width: 1200px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); }
  .comparison-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 2rem; border-bottom: 1px solid #e2e8f0; background: #f8fafc; border-radius: 12px 12px 0 0; }
  .close-button { background: none; border: none; font-size: 2rem; color: #64748b; cursor: pointer; padding: 0; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
  .comparison-content { padding: 2rem; }
  .comparison-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
  .comparison-card { background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; }
  .comparison-card.current { border-color: #10b981; background: #f0fdf4; }
  .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
  .current-badge { background: #10b981; color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
  .method-summary-compact { margin-bottom: 1rem; }
  .method-summary-compact p { margin: 0; font-size: 0.9rem; color: #475569; line-height: 1.4; }
  .score-comparison { margin-bottom: 1rem; }
  .score-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; }
  .score-name { font-size: 0.8rem; color: #64748b; min-width: 110px; font-weight: 500; }
  .score-bar-small { flex: 1; height: 16px; background: #e2e8f0; border-radius: 8px; overflow: hidden; }
  .score-fill-small { height: 100%; background: #0ea5e9; border-radius: 8px; transition: all 0.3s ease; }
  .score-num { font-size: 0.8rem; font-weight: 600; color: #1e293b; min-width: 30px; }
  .method-details { margin-bottom: 1rem; }
  .method-details p { margin: 0; font-size: 0.9rem; color: #475569; line-height: 1.4; }
  .switch-method-button { background: #6366f1; color: white; border: none; border-radius: 6px; padding: 0.5rem 1rem; font-weight: 500; cursor: pointer; transition: all 0.2s ease; width: 100%; }
  .compatibility-compact { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; font-size: 0.9rem; }
  .compatibility-label { font-weight: 500; color: #64748b; }
  .compatibility-value { padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem; font-weight: 600; }
  .compatibility-value.compatible { background: #dcfce7; color: #15803d; }
  .compatibility-value.incompatible { background: #fef3c7; color: #d97706; }

  @media (max-width: 768px) {
    .comparison-modal { margin: 0.5rem; max-height: 95vh; }
    .comparison-content { padding: 1rem; }
    .comparison-grid { grid-template-columns: 1fr; }
  }
</style>
