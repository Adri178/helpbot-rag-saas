/**
 * Outbound links to the source repo, in one place. These used to be
 * hardcoded across LandingFooter and LandingProof, which meant every one
 * of them silently 404'd the moment the repo moved.
 *
 * REPO_URL must match the actual repo. The anchors below must match the
 * heading names in README.md — renaming a section there breaks them
 * without any build error.
 */
export const REPO_URL = "https://github.com/Adri178/helpbot-rag-saas";

export const REPO_LINKS = {
  readme: `${REPO_URL}#readme`,
  security: `${REPO_URL}#isolasi-antar-pengguna`,
  evalResults: `${REPO_URL}/blob/main/eval/results.md`,
} as const;
