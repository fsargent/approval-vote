<script>
import { base } from '$app/paths';

// Carousel state
let currentSlide = 0;
const totalSlides = 6; // 5 rounds + 1 final results

function nextSlide() {
  currentSlide = (currentSlide + 1) % totalSlides;
}

function prevSlide() {
  currentSlide = currentSlide === 0 ? totalSlides - 1 : currentSlide - 1;
}

function goToSlide(index) {
  currentSlide = index;
}
</script>

<svelte:head>
  <title>Fair Share Voting - A Proportional Form of Approval Voting - approval.vote</title>
  <meta name="description" content="Learn about Fair Share Voting, a proportional form of approval voting that maintains local representation while ensuring fair party representation in parliament." />
</svelte:head>

<div class="container">
  <div class="description">
    <h1>Fair Share Voting</h1>
    <p class="subtitle">A proportional form of approval voting that still keeps local representation</p>
  </div>


  <section class="basics-section">
    <div class="section-number">1</div>
    <h2>The Basics (For Everyone)</h2>
    
    <div class="voting-basics">
      <div class="basic-section">
        <h3>🏛️ Voting for Leaders: Simple "Approve" Voting</h3>
        <p>For executive roles like a city mayor, you'd use <a href="{base}/about-approval-voting">Approval Voting</a>. Instead of picking just one candidate, you simply vote "yes" (approve) for as many candidates as you like. The candidate with the most "approves" wins.</p>
      </div>

      <div class="basic-section">
        <h3>🏛️ Voting for Parliament: Proportional Representation</h3>
        <p>For elections to Parliament, you would cast a vote for your preferred political party. The goal here is proportional representation, meaning that if your party gets 20% of the votes nationally, they should get roughly 20% of the seats.</p>
        
        <div class="importance-note">
          <strong>Why This Matters:</strong> Current polls show Reform UK at around 26%, but under First Past The Post they could win a large majority with just over a quarter of votes. Meanwhile, Liberal Democrats polling at 15% might win only a handful of seats, and Greens at 9% could be largely excluded. This system ensures representation that matches vote share.
        </div>
      </div>
    </div>
  </section>

  <section class="participation-section">
    <div class="section-number">2</div>
    <h2>Enhanced Participation (Optional Details)</h2>
    
    <div class="feature">
      <h3>👥 Your Say on Party Candidates</h3>
      <p>When you vote for a party, you can optionally approve individual candidates on their list. Your approvals help decide who gets elected from that party's list if they win seats.</p>
      
      <div class="power-note">
        <strong>The Power of Choice:</strong> You decide how much you want to engage - from simple party voting to detailed candidate approval.
      </div>
    </div>
  </section>

  <section class="process-section">
    <div class="section-number">3</div>
    <h2>The Complete Process (Advanced)</h2>
    <p>This explains how every vote contributes to a seat. No votes are wasted - if your party doesn't get enough votes for a seat directly, your vote gets transferred to help elect someone else.</p>

    <div class="flowchart">
      <div class="flow-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <h4>📊 Calculate "Cost Per Seat"</h4>
          <p>Divide remaining unspent votes by remaining seats</p>
        </div>
        <div class="flow-arrow">↓</div>
      </div>

      <div class="flow-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <h4>🔄 Identify Unspent Votes</h4>
          <p>Find votes beyond what parties need for their seats</p>
        </div>
        <div class="flow-arrow">↓</div>
      </div>

      <div class="flow-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <h4>↗️ Transfer Votes</h4>
          <p>Redistribute from smallest to largest party according to preferences</p>
        </div>
        <div class="flow-arrow">↓</div>
      </div>

      <div class="flow-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <h4>🏆 Award New Seats</h4>
          <p>Parties buy seats they can now afford with transferred votes</p>
        </div>
        <div class="flow-arrow">↓</div>
      </div>

      <div class="flow-step final">
        <div class="step-number">5</div>
        <div class="step-content">
          <h4>🔁 Repeat or Finish</h4>
          <p>Continue until all 650 seats are allocated</p>
        </div>
      </div>
    </div>

    <div class="result-note">
      <strong>The Result:</strong> Every vote contributes to the final outcome, with transfers ensuring broad representation.
    </div>
  </section>

  <section class="ballot-section">
    <h2>📄 Sample Ballot: How You'd Vote</h2>
    <p>Here's what your ballot would look like under this new system:</p>

    <div class="sample-ballot">
      <div class="ballot-header">
        <h3>GENERAL ELECTION BALLOT</h3>
        <p>Manchester Central - May 2029</p>
      </div>

      <div class="ballot-section-content">
        <h4>MAYOR OF MANCHESTER</h4>
        <p><em>Approve as many candidates as you like</em></p>
        <div class="candidate-list">
          <label><input type="checkbox" disabled> Sarah Chen (Labour)</label>
          <label><input type="checkbox" disabled> James Wilson (Conservative)</label>
          <label><input type="checkbox" disabled> Emma Roberts (Liberal Democrat)</label>
          <label><input type="checkbox" disabled> David Kumar (Green)</label>
        </div>
      </div>

      <div class="ballot-section-content">
        <h4>HOUSE OF COMMONS</h4>
        <p><em>Choose ONE party, then optionally approve candidates</em></p>
        <div class="party-list">
          <label><input type="radio" name="party" disabled> Labour Party</label>
          <label><input type="radio" name="party" disabled> Conservative Party</label>
          <label><input type="radio" name="party" disabled checked> Liberal Democrat Party</label>
          <label><input type="radio" name="party" disabled> Green Party</label>
        </div>

        <div class="candidate-approval">
          <h5>Liberal Democrat Candidates (Optional)</h5>
          <div class="candidate-list">
            <label><input type="checkbox" disabled checked> 1. Emma Roberts</label>
            <label><input type="checkbox" disabled checked> 2. Michael Thompson</label>
            <label><input type="checkbox" disabled checked> 3. Lisa Patel</label>
            <label><input type="checkbox" disabled> 4. John Clarke</label>
            <label><input type="checkbox" disabled> 5. Rachel Ahmed</label>
            <p><em>And more candidates...</em></p>
          </div>
        </div>
      </div>

      <div class="voter-choice">
        <strong>What This Voter Did:</strong> Approved 2 mayoral candidates, chose Liberal Democrats for Parliament, and approved 3 specific Lib Dem candidates who would be prioritized if the party wins seats.
      </div>
    </div>
  </section>

  <section class="example-section">
    <div class="section-number">4</div>
    <h2>A Worked Example: 650 Seats, 47 Million Votes</h2>
    
    <div class="carousel-container">
      <!-- Carousel Navigation -->
      <div class="carousel-nav">
        <button class="nav-btn prev" on:click={prevSlide} disabled={currentSlide === 0}>
          ← Previous
        </button>
        
        <div class="slide-indicators">
          {#each Array(totalSlides) as _, index}
            <button 
              class="indicator {currentSlide === index ? 'active' : ''}"
              on:click={() => goToSlide(index)}
            >
              {index + 1}
            </button>
          {/each}
        </div>
        
        <button class="nav-btn next" on:click={nextSlide} disabled={currentSlide === totalSlides - 1}>
          Next →
        </button>
      </div>

      <!-- Carousel Slides -->
      <div class="carousel-wrapper">
        <div class="carousel-track" style="transform: translateX(-{currentSlide * 100}%)">
          
          <!-- Slide 1: Round 1 -->
          <div class="carousel-slide">
            <div class="round-container">
      <div class="round-header">
        <h3>🔄 Round 1: Initial Allocation</h3>
        <div class="round-stats">
          <div class="stat-item">
            <span class="stat-label">Total votes:</span>
            <span class="stat-value">47,000,000</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Seat cost:</span>
            <span class="stat-value">72,308 votes</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Threshold:</span>
            <span class="stat-value">5% (33 seats min)</span>
          </div>
        </div>
      </div>

      <div class="results-table">
        <table>
          <thead>
            <tr>
              <th>Party</th>
              <th>Votes</th>
              <th>%</th>
              <th>Seats Won</th>
              <th>Unspent Votes</th>
            </tr>
          </thead>
          <tbody>
            <tr class="qualified">
              <td><strong>Reform UK</strong></td>
              <td>12,220,000</td>
              <td>26%</td>
              <td>169</td>
              <td>2,608</td>
            </tr>
            <tr class="qualified">
              <td><strong>Labour</strong></td>
              <td>11,750,000</td>
              <td>25%</td>
              <td>162</td>
              <td>26,004</td>
            </tr>
            <tr class="qualified">
              <td><strong>Conservative</strong></td>
              <td>9,870,000</td>
              <td>21%</td>
              <td>136</td>
              <td>56,112</td>
            </tr>
            <tr class="qualified">
              <td><strong>Liberal Democrats</strong></td>
              <td>7,050,000</td>
              <td>15%</td>
              <td>97</td>
              <td>37,724</td>
            </tr>
            <tr class="qualified">
              <td><strong>Green Party</strong></td>
              <td>4,230,000</td>
              <td>9%</td>
              <td>58</td>
              <td>39,136</td>
            </tr>
            <tr class="below-threshold">
              <td><strong>SNP</strong></td>
              <td>1,880,000</td>
              <td>4%</td>
              <td>0</td>
              <td>1,880,000</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="round-summary">
        <div class="seats-progress">
          <span class="seats-filled">622 of 650 seats filled</span>
          <div class="progress-bar">
            <div class="progress-fill" style="width: 95.7%"></div>
          </div>
          <span class="seats-remaining">28 seats remaining</span>
        </div>
        <div class="next-action">
          <strong>Next:</strong> SNP eliminated (below threshold) → 1,880,000 votes transfer to Labour
        </div>
      </div>
    </div>
          </div>

          <!-- Slide 2: Round 2 -->
          <div class="carousel-slide">
            <div class="round-container">
      <div class="round-header">
        <h3>🔄 Round 2: After SNP Transfer</h3>
        <div class="round-stats">
          <div class="stat-item">
            <span class="stat-label">Seat cost:</span>
            <span class="stat-value">72,914 votes</span>
          </div>
          <div class="stat-item transfer">
            <span class="stat-label">Transfer:</span>
            <span class="stat-value">SNP → Labour (1,880,000 votes)</span>
          </div>
        </div>
      </div>

      <div class="results-table">
        <table>
          <thead>
            <tr>
              <th>Party</th>
              <th>Seats</th>
              <th>Unspent Votes</th>
              <th>New Seats</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Reform UK</strong></td>
              <td>169</td>
              <td>2,608</td>
              <td>0</td>
              <td>Active</td>
            </tr>
            <tr class="gains-seats">
              <td><strong>Labour</strong></td>
              <td>162 → 188</td>
              <td>1,906,004 → 10,240</td>
              <td>+26</td>
              <td>Active</td>
            </tr>
            <tr>
              <td><strong>Conservative</strong></td>
              <td>136</td>
              <td>56,112</td>
              <td>0</td>
              <td>Active</td>
            </tr>
            <tr>
              <td><strong>Liberal Democrats</strong></td>
              <td>97</td>
              <td>37,724</td>
              <td>0</td>
              <td>Active</td>
            </tr>
            <tr class="finalized">
              <td><strong>Green Party</strong></td>
              <td>58</td>
              <td>39,136</td>
              <td>0</td>
              <td>Finalized</td>
            </tr>
            <tr class="finalized">
              <td><strong>SNP</strong></td>
              <td>0</td>
              <td>0</td>
              <td>0</td>
              <td>Finalized</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="round-summary">
        <div class="seats-progress">
          <span class="seats-filled">648 of 650 seats filled</span>
          <div class="progress-bar">
            <div class="progress-fill" style="width: 99.7%"></div>
          </div>
          <span class="seats-remaining">2 seats remaining</span>
        </div>
        <div class="next-action">
          <strong>Next:</strong> Green Party eliminated → 39,136 votes transfer to Labour
        </div>
      </div>
    </div>
          </div>

          <!-- Slide 3: Round 3 -->
          <div class="carousel-slide">
            <div class="round-container">
      <div class="round-header">
        <h3>🔄 Round 3: Green Transfer</h3>
        <div class="round-stats">
          <div class="stat-item">
            <span class="stat-label">Seat cost:</span>
            <span class="stat-value">72,910 votes</span>
          </div>
          <div class="stat-item transfer">
            <span class="stat-label">Transfer:</span>
            <span class="stat-value">Green → Labour (39,136 votes)</span>
          </div>
        </div>
      </div>
      <div class="simple-summary">
        <p><strong>No seats awarded this round</strong> - insufficient votes for remaining parties</p>
        <div class="next-action">
          <strong>Next:</strong> Liberal Democrats eliminated → 37,724 votes transfer to Labour
        </div>
      </div>
    </div>
          </div>

          <!-- Slide 4: Round 4 -->
          <div class="carousel-slide">
            <div class="round-container">
      <div class="round-header">
        <h3>🔄 Round 4: LibDem Transfer</h3>
        <div class="round-stats">
          <div class="stat-item">
            <span class="stat-label">Seat cost:</span>
            <span class="stat-value">72,910 votes</span>
          </div>
          <div class="stat-item transfer">
            <span class="stat-label">Transfer:</span>
            <span class="stat-value">LibDem → Labour (37,724 votes)</span>
          </div>
        </div>
      </div>
      <div class="simple-summary">
        <p><strong>Labour gains 1 seat</strong> (87,100 ÷ 72,910 = 1), has 14,190 unspent left</p>
        <div class="seats-progress">
          <span class="seats-filled">649 of 650 seats filled</span>
          <div class="progress-bar">
            <div class="progress-fill" style="width: 99.8%"></div>
          </div>
          <span class="seats-remaining">1 seat remaining</span>
        </div>
        <div class="next-action">
          <strong>Next:</strong> Conservative eliminated → 56,112 votes transfer to Reform
        </div>
      </div>
    </div>
          </div>

          <!-- Slide 5: Round 5 -->
          <div class="carousel-slide">
            <div class="round-container final-round">
      <div class="round-header">
        <h3>🔄 Round 5: Final Allocation</h3>
        <div class="round-stats">
          <div class="stat-item transfer">
            <span class="stat-label">Transfer:</span>
            <span class="stat-value">Conservative → Reform (56,112 votes)</span>
          </div>
          <div class="stat-item transfer">
            <span class="stat-label">Final Transfer:</span>
            <span class="stat-value">Reform → Labour (58,720 votes)</span>
          </div>
        </div>
      </div>
      <div class="simple-summary">
        <p><strong>Labour gets final seat</strong> with exactly 72,910 votes</p>
        <div class="seats-progress">
          <span class="seats-filled">650 of 650 seats filled</span>
          <div class="progress-bar">
            <div class="progress-fill complete" style="width: 100%"></div>
          </div>
          <span class="seats-remaining">✅ Complete</span>
        </div>
      </div>
    </div>
          </div>

          <!-- Slide 6: Final Results -->
          <div class="carousel-slide">
            <div class="final-results">
      <h3>🏆 Final Results</h3>
      <div class="results-grid">
        <div class="result-item">
          <div class="party-name">Labour Party</div>
          <div class="seats">190 seats (29.2%)</div>
          <div class="votes">25% of votes</div>
        </div>
        <div class="result-item">
          <div class="party-name">Reform UK</div>
          <div class="seats">169 seats (26.0%)</div>
          <div class="votes">26% of votes</div>
        </div>
        <div class="result-item">
          <div class="party-name">Conservative</div>
          <div class="seats">136 seats (20.9%)</div>
          <div class="votes">21% of votes</div>
        </div>
        <div class="result-item">
          <div class="party-name">Liberal Democrats</div>
          <div class="seats">97 seats (14.9%)</div>
          <div class="votes">15% of votes</div>
        </div>
        <div class="result-item">
          <div class="party-name">Green Party</div>
          <div class="seats">58 seats (8.9%)</div>
          <div class="votes">9% of votes</div>
        </div>
        <div class="result-item">
          <div class="party-name">SNP</div>
          <div class="seats">0 seats (0%)</div>
          <div class="votes">4% of votes</div>
        </div>
      </div>

      <div class="democratic-result">
        <strong>The Result:</strong> Each party's seat share closely matches their vote share. Labour benefits from vote transfers to form a government, but no party gains a disproportionate majority from a minority of votes. The Lib Dems receive representation matching their support, and smaller parties like the Greens gain a voice in Parliament.
      </div>
    </div>
          </div>
          
        </div> <!-- carousel-track -->
      </div> <!-- carousel-wrapper -->
    </div> <!-- carousel-container -->
  </section>

  <section class="why-matters-section">
    <h2>💡 Why This Matters</h2>

    <div class="benefits">
      <div class="benefit">
        <h3>🎯 Proportional Representation</h3>
        <p>Every vote counts toward the final outcome. Fewer "safe seats" or "wasted votes" - your voice matters wherever you live and whoever you support.</p>
      </div>

      <div class="benefit">
        <h3>🤝 Collaborative Government</h3>
        <p>Encourages parties to work together and find common ground, leading to more moderate, consensus-based policies.</p>
      </div>

      <div class="benefit">
        <h3>📈 Higher Turnout</h3>
        <p>When every vote matters, more people participate. Countries with proportional systems consistently see higher voter turnout.</p>
      </div>
    </div>

    <div class="bottom-line">
      <strong>The Bottom Line:</strong> This system provides government that better represents the electorate, moving beyond the limitations of First Past The Post.
    </div>
  </section>

  <div class="cta-section">
    <h2>Learn More About Voting Systems</h2>
    <p>
      Interested in exploring different approaches to democratic representation?
    </p>
    <div class="cta-buttons">
      <a href="{base}/about-approval-voting" class="cta-button">Learn About Approval Voting</a>
      <a href="{base}/rcv-vs-approval" class="cta-button">Compare RCV vs Approval</a>
    </div>
  </div>
</div>

<style>
  .container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem;
  }

  .description {
    margin-bottom: 2rem;
    text-align: center;
  }

  .description h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    color: #437527;
  }

  .subtitle {
    font-size: 1.2rem;
    color: #6c757d;
    font-style: italic;
    margin: 0;
  }



  section {
    margin: 3rem 0;
    position: relative;
  }

  .section-number {
    position: absolute;
    left: -3rem;
    top: 0;
    width: 2rem;
    height: 2rem;
    background: #437527;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1.2rem;
  }

  @media (max-width: 768px) {
    .section-number {
      position: static;
      margin: 0 auto 1rem auto;
    }
  }

  h2 {
    font-size: 1.8rem;
    margin: 1rem 0;
    color: #437527;
    border-bottom: 2px solid #e9ecef;
    padding-bottom: 0.5rem;
  }

  h3 {
    font-size: 1.4rem;
    margin: 1.5rem 0 1rem 0;
    color: #437527;
  }

  h4 {
    font-size: 1.2rem;
    margin: 1rem 0 0.5rem 0;
    color: #437527;
  }

  h5 {
    font-size: 1.1rem;
    margin: 1rem 0 0.5rem 0;
    color: #6c757d;
  }

  .voting-basics {
    margin: 2rem 0;
  }

  .basic-section {
    margin: 2rem 0;
  }

  .basic-section h3 {
    margin-top: 0;
    margin-bottom: 1rem;
  }

  .importance-note, .power-note, .result-note, .democratic-result, .bottom-line {
    background: #e3f2fd;
    border-left: 4px solid #2196f3;
    padding: 1rem;
    margin: 1rem 0;
    border-radius: 4px;
  }

  .flowchart {
    margin: 2rem 0;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .flow-step {
    display: flex;
    align-items: center;
    margin: 1rem 0;
    position: relative;
  }



  .step-number {
    width: 2.5rem;
    height: 2.5rem;
    background: #437527;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1.1rem;
    flex-shrink: 0;
    margin-right: 1rem;
  }

  .step-content {
    flex: 1;
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 1rem;
    border-left: 4px solid #437527;
  }

  .step-content h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
    color: #437527;
  }

  .step-content p {
    margin: 0;
    font-size: 0.9rem;
    color: #6c757d;
  }

  .flow-arrow {
    position: absolute;
    left: 1.25rem;
    bottom: -1rem;
    font-size: 1.5rem;
    color: #437527;
    background: white;
    width: 2rem;
    text-align: center;
    z-index: 1;
  }

  @media (max-width: 768px) {
    .flowchart {
      max-width: 100%;
    }
    
    .flow-step {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .step-number {
      margin-right: 0;
      margin-bottom: 0.5rem;
    }
    
    .flow-arrow {
      position: static;
      margin: 0.5rem 0;
      width: auto;
    }
  }

  .sample-ballot {
    background: white;
    border: 2px solid #437527;
    border-radius: 8px;
    padding: 2rem;
    margin: 2rem 0;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .ballot-header {
    text-align: center;
    border-bottom: 2px solid #437527;
    padding-bottom: 1rem;
    margin-bottom: 2rem;
  }

  .ballot-header h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
  }

  .ballot-section-content {
    margin: 2rem 0;
    border-bottom: 1px solid #e9ecef;
    padding-bottom: 1.5rem;
  }

  .ballot-section-content:last-of-type {
    border-bottom: none;
  }

  .candidate-list, .party-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin: 1rem 0;
  }

  .candidate-list label, .party-list label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0;
  }

  .candidate-approval {
    background: #f8f9fa;
    border-radius: 6px;
    padding: 1rem;
    margin-top: 1rem;
  }

  .voter-choice {
    background: #e8f5e8;
    border: 1px solid #437527;
    border-radius: 6px;
    padding: 1rem;
    margin-top: 1rem;
  }

  .round-container {
    background: white;
    border: 2px solid #e9ecef;
    border-radius: 12px;
    margin: 2rem 0;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .round-container.final-round {
    border-color: #437527;
    background: linear-gradient(135deg, #f8f9fa 0%, #e8f5e8 100%);
  }

  .round-header {
    background: linear-gradient(135deg, #437527 0%, #5a8f35 100%);
    color: white;
    padding: 1.5rem;
  }

  .round-header h3 {
    margin: 0 0 1rem 0;
    font-size: 1.3rem;
  }

  .round-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .stat-item {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 6px;
    padding: 0.5rem 1rem;
    min-width: 150px;
  }

  .stat-item.transfer {
    background: rgba(255, 255, 255, 0.25);
  }

  .stat-label {
    display: block;
    font-size: 0.8rem;
    opacity: 0.9;
    margin-bottom: 0.25rem;
  }

  .stat-value {
    display: block;
    font-weight: bold;
    font-size: 0.95rem;
  }

  .results-table {
    padding: 1.5rem;
  }

  .results-table table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .results-table th {
    background: #f8f9fa;
    color: #495057;
    font-weight: 600;
    padding: 0.75rem;
    text-align: left;
    border-bottom: 2px solid #e9ecef;
    font-size: 0.9rem;
  }

  .results-table td {
    padding: 0.75rem;
    border-bottom: 1px solid #f8f9fa;
    font-size: 0.9rem;
  }

  .results-table tr:last-child td {
    border-bottom: none;
  }

  .results-table tr.qualified {
    background: #f8f9fa;
  }

  .results-table tr.below-threshold {
    background: #fff3cd;
    color: #856404;
  }

  .results-table tr.below-threshold td {
    font-style: italic;
  }

  .results-table tr.finalized {
    background: #e2e3e5;
    color: #6c757d;
  }

  .results-table tr.gains-seats {
    background: #d1ecf1;
    color: #0c5460;
  }

  .results-table tr.gains-seats td {
    font-weight: 600;
  }

  .round-summary {
    padding: 1.5rem;
    background: #f8f9fa;
    border-top: 1px solid #e9ecef;
  }

  .simple-summary {
    padding: 1.5rem;
  }

  .simple-summary p {
    margin: 0 0 1rem 0;
    font-size: 1.05rem;
  }

  .seats-progress {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  .seats-filled {
    font-weight: 600;
    color: #437527;
    min-width: 120px;
  }

  .seats-remaining {
    font-weight: 600;
    color: #6c757d;
    min-width: 100px;
  }

  .progress-bar {
    flex: 1;
    height: 8px;
    background: #e9ecef;
    border-radius: 4px;
    overflow: hidden;
    min-width: 200px;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #437527 0%, #5a8f35 100%);
    transition: width 0.3s ease;
  }

  .progress-fill.complete {
    background: linear-gradient(90deg, #28a745 0%, #20c997 100%);
  }

  .next-action {
    background: #e3f2fd;
    border-left: 4px solid #2196f3;
    padding: 1rem;
    border-radius: 4px;
    font-size: 0.95rem;
  }

  /* Carousel Styles */
  .carousel-container {
    margin: 2rem 0;
  }

  .carousel-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
  }

  .nav-btn {
    background: #437527;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s ease;
    font-size: 0.9rem;
  }

  .nav-btn:hover:not(:disabled) {
    background: #365a1f;
    transform: translateY(-1px);
  }

  .nav-btn:disabled {
    background: #6c757d;
    cursor: not-allowed;
    transform: none;
  }

  .slide-indicators {
    display: flex;
    gap: 0.5rem;
  }

  .indicator {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    border: 2px solid #437527;
    background: white;
    color: #437527;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s ease;
    font-size: 0.9rem;
  }

  .indicator:hover {
    transform: scale(1.1);
  }

  .indicator.active {
    background: #437527;
    color: white;
    box-shadow: 0 2px 8px rgba(67, 117, 39, 0.3);
  }

  .carousel-wrapper {
    overflow: hidden;
    border-radius: 12px;
    background: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .carousel-track {
    display: flex;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;
  }

  .carousel-slide {
    min-width: 100%;
    flex-shrink: 0;
  }

  .carousel-slide .round-container,
  .carousel-slide .final-results {
    margin: 0;
    border-radius: 0;
    box-shadow: none;
  }

  @media (max-width: 768px) {
    .carousel-nav {
      flex-direction: column;
      gap: 1rem;
    }

    .slide-indicators {
      order: -1;
    }

    .nav-btn {
      width: 100%;
      max-width: 200px;
    }

    .round-stats {
      flex-direction: column;
    }

    .stat-item {
      min-width: auto;
    }

    .seats-progress {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .progress-bar {
      width: 100%;
      min-width: auto;
    }

    .results-table {
      overflow-x: auto;
    }

    .results-table table {
      min-width: 600px;
    }
  }

  .final-results {
    background: linear-gradient(135deg, #e8f5e8 0%, #f8f9fa 100%);
    border: 2px solid #437527;
    border-radius: 12px;
    padding: 2rem;
    margin: 2rem 0;
  }

  .results-grid {
    display: grid;
    gap: 1rem;
    margin: 2rem 0;
  }

  @media (min-width: 768px) {
    .results-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .result-item {
    background: white;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 1rem;
    text-align: center;
  }

  .party-name {
    font-weight: bold;
    color: #437527;
    font-size: 1.1rem;
  }

  .seats {
    font-size: 1.3rem;
    font-weight: bold;
    margin: 0.5rem 0;
  }

  .votes {
    color: #6c757d;
    font-size: 0.9rem;
  }

  .benefits {
    display: grid;
    gap: 2rem;
    margin: 2rem 0;
  }

  @media (min-width: 768px) {
    .benefits {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .benefit {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 1.5rem;
    text-align: center;
  }

  .benefit h3 {
    margin-top: 0;
    font-size: 1.3rem;
  }

  .cta-section {
    text-align: center;
    margin: 3rem 0;
    padding: 2rem;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
  }

  .cta-buttons {
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
    margin-top: 1rem;
  }

  .cta-button {
    display: inline-block;
    background: #437527;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    text-decoration: none;
    font-weight: 600;
    transition: background-color 0.2s;
  }

  .cta-button:hover {
    background: #365a1f;
    text-decoration: none;
  }

  @media (max-width: 768px) {
    .results-grid,
    .benefits {
      grid-template-columns: 1fr;
    }

    .cta-buttons {
      flex-direction: column;
      align-items: center;
    }
    
    .basic-section {
      margin: 1.5rem 0;
    }
  }
</style>