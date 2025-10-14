<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  type MethodListItem = {
    id: string;
    name: string;
    shortDescription: string;
    isProportional: boolean;
    recommended?: boolean;
    redFlag?: boolean;
  };

  export let methods: MethodListItem[] = [];
  export let selectedId: string | null = null;

  const dispatch = createEventDispatcher<{ select: string }>();

  function handleSelect(id: string) {
    dispatch('select', id);
  }
</script>

<div class="methods-gallery">
  <div class="gallery-header">
    <h2>📚 Voting Methods</h2>
    <p class="section-description">Showing {methods.length} method{methods.length===1?'':'s'}</p>
  </div>
  <div class="methods-grid">
    {#each methods as method}
      <button
        class="method-card"
        class:selected={selectedId === method.id}
        onclick={() => handleSelect(method.id)}
      >
        <div class="method-card-header">
          <h3 class="method-title">{method.name}</h3>
          <div class="badge-group">
            {#if method.isProportional}
              <span class="badge proportional" title="Proportional representation">⚖️</span>
            {/if}
            {#if method.recommended}
              <span class="badge recommended" title="Recommended">⭐</span>
            {/if}
            {#if method.redFlag}
              <span class="badge redflag" title="Complex or known major weaknesses">🛑</span>
            {/if}
          </div>
        </div>
        <p class="method-desc">{method.shortDescription}</p>
      </button>
    {/each}
  </div>
</div>

<style>
  .methods-gallery { margin-bottom: 1.5rem; min-width: 0; }
  .gallery-header { display: flex; align-items: baseline; gap: 1rem; justify-content: space-between; }
  .methods-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 0.75rem;
  }
  .method-card {
    text-align: left;
    padding: 0.9rem 1rem;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    background: #fff;
    cursor: pointer;
  }
  .method-card.selected, .method-card:focus { outline: 2px solid #437527; outline-offset: 0; }
  .method-card-header { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
  .badge-group { display: inline-flex; align-items: center; gap: 6px; line-height: 1; }
  .method-title { margin: 0; font-size: 1rem; color: #222; }
  .badge { font-size: 1rem; display: inline-block; transform: translateY(1px); }
  .badge.recommended { margin-left: 4px; }
  .badge.redflag { margin-left: 4px; }
</style>


