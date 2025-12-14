<script>
  import { resolve } from '$app/paths';
</script>

<title>About approval.vote</title>

<div class="container">
  <div class="description">
    <h1>
    <a href="{resolve('/')}">approval.vote</a>
    //
    <strong>About</strong>
  </h1>
  </div>

  <p>
    <a href="https://en.wikipedia.org/wiki/Approval_Voting"> Approval Voting elections </a>
    produce a lot of data about voter preferences. Typically, this information is made available by election
    boards in specialized file formats and requires processing to interpret. The purpose of approval.vote
    is to increase transparency into these elections by creating detailed and intuitive reports about
    them.
  </p>

  <p>
    With Approval Voting voters can choose as many candidates as they like, and the one receiving
    the most votes wins.
  </p>

  <p>
    approval.vote is maintained by
    <a href="https://felixsargent.com">Felix Sargent</a>. It is a fork from the original work of
    <a href="https://paulbutler.org">Paul Butler's</a>
    <a href="https://ranked.vote">ranked.vote</a>. It is non-partisan and has received no outside
    funding.
  </p>

  <h2>License</h2>

  <p>
    This website is
    <a href="https://github.com/electionscience/approval-vote">open source</a> and liberally
    licensed. Website content and generated reports may be freely distributed with attribution under
    the <a href="https://creativecommons.org/licenses/by/2.0/">CC-BY</a> license.
  </p>

  <h2>Colophon</h2>

  <p>
    This website, including visualizations, was created with <a href="https://svelte.dev/">Svelte</a
    >, and is hosted on <a href="https://github.com/electionscience/approval-vote">Github Pages</a>.
    The font is <a href="https://github.com/adobe-fonts/source-sans-pro">Source Sans Pro</a>.
  </p>

  <p>
    For more detailed information about approval voting, including academic research and comparisons
    with other voting systems, see our <a href="{resolve('/about-approval-voting')}"
      >comprehensive guide to approval voting</a
    >.
  </p>

  <h2>Database Access</h2>

  <p>
    The election data is stored in a SQLite database. You can explore it using
    <a href="{resolve('/data')}">Datasette Lite</a>, which runs entirely in your browser. The
    database file is also available directly from
    <a href="https://github.com/fsargent/approval-vote/blob/main/data.sqlite3">GitHub</a>.
  </p>
</div>
