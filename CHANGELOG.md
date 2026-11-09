# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-11-09
### Added
- Public "Contact us" page (`/contact`) in the Organizations & Profiles bounded context: the inquiry is stored as a `ContactInquiry` with status `received`, with validation, confirmation, English and Spanish texts and ARIA attributes. It is linked from the public header and from the environment selection.
- Global search of a record by its exact code from the top bar; quality documents and batches open from the URL.
- Confirmation before leaving the registration with unsaved data.
- DoofPlus shield as favicon.
### Changed
- Public pages link one level up and, in development, to the local website.
- "Contact us" has the same look as the AW frontend (fields, card shadow and footer).
- CONTRIBUTING.md uses the `doofplus-web-application` repository name in its title.
### Fixed
- Role permissions are translated in the profile matrix and in the invitation form.
- Contact us titles no longer overlap on mobile.
- Dosage forms in the product catalog and evidence package metadata in audits are translated.
- Feedback and lock states when receiving materials and saving the CAPA root cause; change details in every audit trail event; evidence removal while uploading.
- Terms and privacy links of the footer open in a new tab.
### Removed
- Redundant "Invite user" button of the administration overview.

## [1.0.2] - 2026-11-01
### Fixed
- Links to the website (back link, help, terms and privacy) use the URL published by the IngesCompany organization.

## [1.0.1] - 2026-10-09
### Fixed
- The production build reads the fake API published on Render instead of `localhost:3000`.
- Tables and alerts of seven views copied before the accessibility work now have names and roles for screen readers.
- Seed data: material lot RM-26104 starts in sampling again.
### Added
- Firebase project alias in `.firebaserc`; the deploy cache `.firebase/` is ignored.

## [1.0.0] - 2026-10-09
### Added
- Identity & Access Management (IAM) bounded context: environment selection, sign-in with two-factor code, role-based access and user invitations.
- Organizations & Profiles bounded context: organization registration, administration overview and profile preferences.
- Subscriptions & Payments bounded context: plans, plan change and billing history.
- Manufacturing & Batch Management bounded context: production overview, orders, products and master formulas, batches and raw-material receipt.
- IoT Monitoring bounded context: IoT overview, equipment and sensors, incidents and batch IoT evidence.
- Quality & Compliance bounded context: quality overview, documents, deviations and CAPA, analytical results, batch release, audits, audit trail, regulatory reports and tasks.
- Frontend layout, Angular Material setup, English and Spanish translations, and json-server fake API integration.
- Firebase Hosting configuration and a start script to publish the fake API.
