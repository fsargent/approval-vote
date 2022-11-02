

<script>
  import { base } from '$app/paths';
  import ElectionIndex from "../components/ElectionIndex.svelte";
</script>

<title>approval.vote: detailed reports on approval voting elections.</title>

<div class="wide container">
<div class="row">
  <div class="leftCol">
    <div class="description">
      <h1>approval.vote</h1>:
      detailed reports on approval voting elections.
    </div>
    <p>
      In an <a href="https://en.wikipedia.org/wiki/Approval_Voting">
        Approval Voting election</a> voters can pick all the candidates that they like, which produces more data on voter preferences than
      pick-one elections.
    </p>

    <p>
      <strong>approval.vote</strong> is a project of
         <a href="https://felixsargent.com">Felix Sargent</a>. It is a fork of <a href="https://paulbutler.org">Paul Butler's</a> <a href="https://ranked.vote">ranked.vote</a>.
        It is non-partisan and has received no outside funding.
      For more information, see <a href="{ base }/about">the about page</a>.
    </p>
  </div>

  <div class="rightCol">
    <ElectionIndex />
  </div>
</div>
</div>