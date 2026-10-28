/**
 * traks.dev's own custom events, on top of everything the tracker in
 * index.html records by itself (pageviews, sources, outbound links, file
 * downloads, WebMCP tool calls). Every event the site sends is named here, so
 * the goals and funnels set up in the dashboard have one list to match.
 *
 * Props stay coarse on purpose: never a token, account id, instance name,
 * domain, claim code or error text - only which button, which step, which
 * outcome.
 */
export const EVENTS = {
  /** A "Deploy" button on the landing page; props.from = nav | hero | cta. */
  CTA_DEPLOY: 'cta_deploy',
  /** The product film was opened. */
  FILM_PLAY: 'film_play',
  /** A landing section scrolled into view; props.section = its id. */
  SECTION_VIEW: 'section_view',
  /** The contact dialog opened; props.from = nav | section | footer. */
  CONTACT_OPEN: 'contact_open',
  /** The email address was copied from the contact dialog. */
  CONTACT_COPY: 'contact_copy_email',

  /** Deploy wizard: a fresh install session was created. */
  DEPLOY_START: 'deploy_start',
  /** Deploy wizard: a returning ?instance= session was picked up. */
  DEPLOY_RESUME: 'deploy_resume',
  /** Deploy wizard: Cloudflare connected and the storage token verified;
   *  props.method = oauth | token. */
  DEPLOY_CONNECTED: 'deploy_connected',
  /** Deploy wizard: the provision run was requested; props.domain =
   *  custom | workers.dev, props.attempt = first | retry. */
  DEPLOY_RUN: 'deploy_run',
  /** Deploy wizard: the instance came up. */
  DEPLOY_SUCCESS: 'deploy_success',
  /** Deploy wizard: the run failed; props.step = the failing step's id. */
  DEPLOY_FAIL: 'deploy_fail',

  /** Update flow: an update run was requested. */
  UPDATE_START: 'update_start',
  UPDATE_SUCCESS: 'update_success',
  /** props.step = the failing step's id. */
  UPDATE_FAIL: 'update_fail',

  /** Remove flow: an instance was torn down. */
  DESTROY_SUCCESS: 'destroy_success',

  /** An unknown path rendered the not-found page; props.path. */
  NOT_FOUND: '404',
} as const;

type EventName = (typeof EVENTS)[keyof typeof EVENTS];

/** Send one event. Never throws, and a no-op if the tracker is blocked. */
export function track(name: EventName, props?: Record<string, string>): void {
  try {
    (window as unknown as { traks?: (n: string, p?: Record<string, string>) => void }).traks?.(
      name,
      props
    );
  } catch {
    /* analytics must never break the page */
  }
}

/** The id of the last step that failed in a deploy/update run, for a
 *  failure event's props. Step ids are fixed slugs ('d1', 'custom-domain'),
 *  never user data. */
export function failedStep(steps: { stepId: string; status: string }[]): string {
  for (let i = steps.length - 1; i >= 0; i--) {
    if (steps[i].status === 'fail') return steps[i].stepId;
  }
  return 'unknown';
}
