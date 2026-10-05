---
title: "Patient-specific Y-90 radioembolization dosimetry"
collection: portfolio
order: 3
featured: true
art: dose
seed: 8
status: "Private"
tags: [Dosimetry, Python, CFDose]
excerpt: "From the CFD or PINN flow split to microsphere transport to a 3D absorbed-dose map in Gy."
---
This pipeline turns a computed blood-flow split into a patient-specific absorbed-dose map for Yttrium-90 radioembolization, a targeted therapy for liver tumors. It is a self-contained Python re-implementation of the CFDose dose-point-kernel method, cross-checked against MIRD.

It takes the per-outlet flow split from CFD or a PINN, places microspheres in proportion to flow, convolves their activity with a Monte Carlo dose-point kernel, and produces a three-dimensional absorbed-dose map in gray (Gy), with dose-volume histograms and per-segment doses. Dosing the same patient from the PINN and the COMSOL flow splits gives closely matching results.

*The code is private and available on request.*
