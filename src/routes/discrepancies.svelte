<script>
  import { resolve } from '$app/paths';
</script>

<title>approval.vote: Understanding Discrepancies</title>

<div class="container">
  <div class="description">
    <h1><a href="{resolve('/')}">approval.vote</a>: Understanding Discrepancies</h1>
  </div>

  <p>
    All of the analysis that goes into approval.vote reports is based only on ballot-level data.
  </p>

  <p>In some cases, these tabulations don't match the official tabulations.</p>
  <p>
    Another source of discrepancies is the handling of undervotes/overvotes and write-ins. To the
    extent possible, we follow the statutes in the relevant jurisdiction in order to treat ballots
    the same way that the elections board does. But statues aren't code, so there are sometimes
    cases where there are ambiguities around edge cases. In particular, the treatment of write-in
    candidates can be a complicating factor, because many jurisdictions replace them with a generic
    “write in” dummy candidate, which does not always reflect how they are treated in the official
    tabulation.
  </p>
</div>
