# CommentScope experimental system

Source code for the system used in *Embedding User Comments into Long-Form Reading: Design and Evaluation of Contextual Comment Presentation*.

## Scope of this release

This is a **system-only source release**, not a study dataset or an analysis-results archive. It contains the Vue frontend, Tornado backend, database schema/initialization code, curated experimental stimuli, allocation configuration, and automated tests.

It contains **no participant response exports, populated databases, participant-name mappings, interviews, consent records, logs, researcher screenshots, or original repository history**. The administrator's simulated-preview data/mode have been removed. Empty dashboards do not substitute fabricated observations. P01–P24 are generic configurable allocation slots, not participant records. Small synthetic inputs in automated tests test software behavior only; they are not empirical observations or a downloadable simulated study dataset.

`server/materials.json` contains reading passages, stimulus comments, question/answer definitions, and research-design metadata. These are experimental inputs, **not participant submissions**. They must not be confused with a public release of empirical comments or answers. Third-party source materials remain subject to their applicable rights; no blanket license for third-party content is asserted here.

The source release removes simulated previews and retest-specific identifiers and replaces insecure administrator defaults. It preserves the experiment implementation, but is not a byte-identical archival build of the deployment used during data collection.

## Local setup

Prerequisites: Python 3.9+ and an environment compatible with Vue CLI 5 (the included Dockerfile uses Node 18). The frontend is built with `npm ci` using its lockfile.

```sh
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env: choose a unique ADMIN_PASSWORD and a random ADMIN_SESSION_SECRET.
# Example secret generation: python3 -c 'import secrets; print(secrets.token_urlsafe(48))'
set -a
. ./.env
set +a
cd client
npm ci
npm run build
cd ..
python3 server/server.py
```

Open `http://localhost:8888/comment_scope/`; the researcher pages are `/admin` and `/admin/analysis`. If running the Vue development server, run `npm run serve` in `client`; its proxy expects the backend on port 8888. Environment files are not loaded automatically by the Python application: export them as shown above.

A **new empty database** is initialized locally on first use. No existing empirical records are distributed. The database schema and collection routes are provided to run a separately authorized study, not as authorization to collect data from anyone.

## Security and data handling

There is no built-in default administrator password or persistent cookie-signing secret. Startup requires `ADMIN_SESSION_SECRET` of at least 32 characters; login is disabled when `ADMIN_PASSWORD` is absent. Keep `.env`, databases, backups, exports and any newly collected records private. `.gitignore` and `.dockerignore` exclude common outputs but cannot replace manual review.

Use **localhost only** for evaluation. `app.listen` binds the backend port; do not expose it to an untrusted network, forward the port or use a public deployment without a separate security review, HTTPS, appropriate access controls and an approved data-management plan. Researcher routes can expose/export records and reset sessions. Set `ADMIN_COOKIE_SECURE=1` when using HTTPS. The participant-facing protocol uses allocation codes, not individual passwords. Do not run it as an open internet data-collection service.

Docker builds the application only. Supply secrets with an environment file at runtime; bind the host port to localhost, e.g. `docker run --env-file .env -p 127.0.0.1:8888:8888 IMAGE`. Persist any authorized new data privately.

## Validation

```sh
pip install -r requirements-dev.txt
node client/tests/public-release.test.cjs
node client/tests/participant-allocation.test.cjs
python3 -m pytest server/tests/test_admin_auth.py -q
python3 -m pytest server/tests -q
```

The release-specific tests verify no simulated dashboard datasets and empty/supplied API summary behavior, as well as administrator configuration. **The legacy full test suite has pre-existing failures** involving older material expectations, allocation/filter assumptions and event schemas; do not interpret it as a fully passing suite. The source release is not a validation or reanalysis of paper results. The older `experiment-flow.test.cjs` and `admin-dashboard.test.cjs` also contain stale source-text expectations; they are retained rather than disguising the baseline by deleting those tests.

## Research data

Participant-level records are not in this repository. Data-access restrictions and any separate aggregate-data deposit are described in the accompanying manuscript's Data Availability Statement. This software repository is not the participant-level research data repository.
