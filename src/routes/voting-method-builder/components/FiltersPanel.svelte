<script lang="ts">
  import { ballotTypes, limitedChoicesOptions } from '$lib/voting/builder-utils';

  export let electionFacet: string[] = [];
  export let ballotFacetSelections: string[] = [];
  export let choiceFacetSelections: string[] = [];
  export let partyFacetSelections: string[] = [];
  export let inUseOnly: boolean = false;

  export let updateElectionFacet: (v: string[]) => void;
  export let updateBallotFacetSelections: (v: string[]) => void;
  export let updateChoiceFacetSelections: (v: string[]) => void;
  export let updatePartyFacetSelections: (v: string[]) => void;
  export let setInUseOnly: (v: boolean) => void;

  export let activeTooltip: string | null = null;
  export let toggleTooltip: (id: string) => void;

  function toggleSelection(list: string[], value: string): string[] {
    return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
  }
</script>

<section class="config-section">
  <h2>🔎 Filters</h2>
  <p class="section-description">
    Use these facets to narrow down voting methods. They don't lock in a choice — pick a method on the right when ready.
  </p>

  <!-- Election Type Facet -->
  <div class="facet-group">
    <h3 class="facet-title">
      Election Type
      <span
        class="facet-tip"
        role="button"
        tabindex="0"
        onclick={(e) => {
          e.stopPropagation();
          toggleTooltip('facet-election');
        }}
        onkeydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            toggleTooltip('facet-election');
          }
        }}>ⓘ</span
      >
    </h3>
    {#if activeTooltip === 'facet-election'}
      <div class="info-panel">
        Single-winner methods elect one seat; multi-winner methods elect multiple seats (for councils/assemblies). This choice affects which methods are compatible and whether proportional representation is possible.
      </div>
    {/if}
    <div class="facet-grid">
      <label class="facet-check">
        <input
          type="checkbox"
          checked={electionFacet.includes('single')}
          onchange={() => updateElectionFacet(toggleSelection(electionFacet, 'single'))}
        />
        <span>Single Winner</span>
      </label>
      <label class="facet-check">
        <input
          type="checkbox"
          checked={electionFacet.includes('multi')}
          onchange={() => updateElectionFacet(toggleSelection(electionFacet, 'multi'))}
        />
        <span>Multi Winner</span>
      </label>
    </div>
  </div>

  <!-- Ballot Type Facet -->
  <div class="facet-group">
    <h3 class="facet-title">
      Ballot Type
      <span
        class="facet-tip"
        role="button"
        tabindex="0"
        onclick={(e) => {
          e.stopPropagation();
          toggleTooltip('facet-ballot');
        }}
        onkeydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            toggleTooltip('facet-ballot');
          }
        }}>ⓘ</span
      >
    </h3>
    {#if activeTooltip === 'facet-ballot'}
      <div class="info-panel">
        How voters express preferences: Choose‑X (select candidates), Ranked (order candidates), Score (rate candidates). Different methods require different ballot types.
      </div>
    {/if}
    <div class="facet-grid">
      {#each ballotTypes as option}
        <label class="facet-check">
          <input
            type="checkbox"
            checked={ballotFacetSelections.includes(option.id)}
            onchange={() => updateBallotFacetSelections(toggleSelection(ballotFacetSelections, option.id))}
          />
          <span>{option.name}</span>
        </label>
      {/each}
    </div>
  </div>

  <!-- Choice Limit Facet (only visible when Choose X is selected) -->
  {#if ballotFacetSelections.includes('choose-x')}
    <div class="facet-group">
      <h3 class="facet-title">
        Choose‑X Limits
        <span
          class="facet-tip"
          role="button"
          tabindex="0"
          onclick={(e) => {
            e.stopPropagation();
            toggleTooltip('facet-choosex');
          }}
          onkeydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              toggleTooltip('facet-choosex');
            }
          }}>ⓘ</span
        >
      </h3>
      {#if activeTooltip === 'facet-choosex'}
        <div class="info-panel">
          For Choose‑X ballots: Pick 1 (FPTP) versus Pick up to X or Approve any. This changes which methods fit and the strategic properties.
        </div>
      {/if}
      <div class="facet-grid">
        {#each limitedChoicesOptions as option}
          <label class="facet-check">
            <input
              type="checkbox"
              checked={choiceFacetSelections.includes(option.id)}
              onchange={() => updateChoiceFacetSelections(toggleSelection(choiceFacetSelections, option.id))}
            />
            <span>{option.name}</span>
          </label>
        {/each}
      </div>
      <p class="facet-help">These options apply to choose‑X ballots.</p>
    </div>
  {/if}

  <!-- Party-Based Facet -->
  <div class="facet-group">
    <h3 class="facet-title">
      Party Structure
      <span
        class="facet-tip"
        role="button"
        tabindex="0"
        onclick={(e) => {
          e.stopPropagation();
          toggleTooltip('facet-party');
        }}
        onkeydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            toggleTooltip('facet-party');
          }
        }}>ⓘ</span
      >
    </h3>
    {#if activeTooltip === 'facet-party'}
      <div class="info-panel">
        Some methods require parties and allocate seats by party vote (e.g., Party List, MMP). Others are candidate‑based and work without parties.
      </div>
    {/if}
    <div class="facet-grid">
      <label class="facet-check">
        <input
          type="checkbox"
          checked={partyFacetSelections.includes('party-required')}
          onchange={() => updatePartyFacetSelections(toggleSelection(partyFacetSelections, 'party-required'))}
        />
        <span>Requires parties (e.g., Party List, MMP)</span>
      </label>
      <label class="facet-check">
        <input
          type="checkbox"
          checked={partyFacetSelections.includes('no-party-required')}
          onchange={() => updatePartyFacetSelections(toggleSelection(partyFacetSelections, 'no-party-required'))}
        />
        <span>Candidate-based (no parties required)</span>
      </label>
    </div>
  </div>

  <!-- In-use Facet -->
  <div class="facet-group">
    <h3 class="facet-title">
      Real‑World Use
      <span
        class="facet-tip"
        role="button"
        tabindex="0"
        onclick={(e) => {
          e.stopPropagation();
          toggleTooltip('facet-inuse');
        }}
        onkeydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            toggleTooltip('facet-inuse');
          }
        }}>ⓘ</span
      >
    </h3>
    {#if activeTooltip === 'facet-inuse'}
      <div class="info-panel">Show only methods that are currently used in at least one country or jurisdiction.</div>
    {/if}
    <div class="facet-grid">
      <label class="facet-check">
        <input type="checkbox" checked={inUseOnly} onchange={(e) => setInUseOnly((e.target as HTMLInputElement).checked)} />
        <span>Currently in use</span>
      </label>
    </div>
  </div>
</section>

<style>
  .config-section { margin-bottom: 2.5rem; padding: 1.5rem; background: #f9f9f9; border-radius: 8px; border-left: 4px solid #437527; }
  .config-section h2 { margin-top: 0; margin-bottom: 0.5rem; color: #333; }
  .section-description { margin-bottom: 1rem; color: #666; font-style: italic; }
  .facet-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.5rem; margin-bottom: 0.5rem; }
  .facet-group { margin-bottom: 1.25rem; }
  .facet-title { margin: 0 0 0.5rem 0; font-size: 1rem; color: #333; }
  .facet-help { color: #777; font-size: 0.9rem; margin: 0.25rem 0 0; }
  .facet-check { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; background: #fff; border: 1px solid #e0e0e0; border-radius: 6px; }
  .facet-check input { transform: scale(1.1); }
  .facet-tip { font-size: 0.9rem; color: #64748b; margin-left: 0.35rem; cursor: help; user-select: none; }
  .info-panel { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0.75rem; font-size: 0.875rem; line-height: 1.4; color: #475569; margin-top: 0.5rem; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); }
</style>
