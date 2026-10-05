---
title: "Physics-informed neural networks for hepatic-artery hemodynamics"
collection: portfolio
order: 1
featured: true
art: streamlines
seed: 4
status: "Private"
tags: [PINNs, PhysicsNeMo, CFD]
excerpt: "PINNs that solve the Navier–Stokes equations on a patient-specific hepatic arterial tree with 46 outlets, validated against COMSOL CFD and feeding Y-90 dose planning."
---
As part of my postdoctoral research at UC Davis, I develop physics-informed neural networks (PINNs) that solve the Navier–Stokes equations for blood flow in a patient-specific hepatic arterial tree with 46 outlets, in both steady and pulsatile (transient) regimes.

Built on **NVIDIA PhysicsNeMo** and validated against **COMSOL** CFD, the work benchmarks 21 versions across architectures (MLP, Fourier features, modified and multi-scale Fourier, SIREN, and finite-basis PINNs), soft and hard boundary conditions, the amount of CFD data assimilated, and steady and transient regimes, with three-element Windkessel outlets for pulsatile flow.

The velocity and pressure fields agree closely with COMSOL (pressure R² ≈ 0.999). Turning that field accuracy into an accurate per-outlet flow split, the quantity that decides where Y-90 microspheres go, is the central open problem. The predicted flow split feeds a downstream Y-90 radioembolization dose calculation.

*The code is private and available on request.*
