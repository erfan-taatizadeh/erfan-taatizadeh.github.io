---
title: "Physics-informed neural networks for hepatic-artery hemodynamics"
collection: portfolio
order: 1
featured: true
art: streamlines
seed: 4
status: "Private"
tags: [PINNs, PhysicsNeMo, CFD]
excerpt: "PINNs that solve the Navier–Stokes equations on patient-specific liver arteries, validated against COMSOL CFD and feeding Y-90 dose planning."
---
As part of my postdoctoral research at UC Davis, I develop physics-informed neural networks (PINNs) that solve the Navier–Stokes equations for blood flow in patient-specific hepatic-artery geometries.

Built on **NVIDIA PhysicsNeMo** and validated against **COMSOL** CFD, the models span more than 20 versions across architectures (MLP, Fourier features, modified and multi-scale Fourier, SIREN, and finite-basis PINNs), boundary-condition schemes, and steady and transient regimes. The predicted flow split feeds a downstream Y-90 radioembolization dose calculation.

*The code is private and available on request.*
