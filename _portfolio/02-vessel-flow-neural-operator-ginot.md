---
title: "GINOT: a graph-informed neural operator for vessel blood flow"
collection: portfolio
order: 2
featured: true
art: operator
seed: 2
status: "Private"
tags: [Neural operators, DeepONet, PhysicsNeMo]
excerpt: "Predicts steady 3D velocity and pressure in branching vessels from the surface mesh alone, in a single forward pass instead of a new CFD solve."
---
GINOT is a graph-informed neural operator that extends DeepONet: a MeshGraphNet branch encodes the vessel surface, a geometry-aware trunk encodes each query point, and cross-attention fuses the two. Given only a vessel surface mesh, it predicts the steady 3D velocity and pressure field in a single forward pass, with no new mesh or CFD solve.

It is built on **NVIDIA PhysicsNeMo** and trained against **COMSOL** CFD for 18 branching vessel geometries with two to four outlets, with optional Navier–Stokes and boundary-condition losses. It reaches a mean validation R² of about 0.83 on the training geometries and about 0.66 on a geometry it never saw, and closing that generalization gap is the current focus.

*The code is private and available on request.*
