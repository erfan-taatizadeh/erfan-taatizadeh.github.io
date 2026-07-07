---
title: "Research"
permalink: /research/
author_profile: true
---

My research develops physics-based and machine-learning models that make engineering and medical systems faster to simulate, easier to understand, and possible to optimize. A thread running through all of it is **coupling first-principles modeling — multiphysics finite-element simulation — with modern scientific machine learning**, so that expensive simulations become fast surrogates usable in design loops and, increasingly, in clinical decision-making.

Physics-informed machine learning for liver-cancer therapy
======
*Postdoctoral research · UC Davis (Biomedical Engineering & Radiology)*

Yttrium-90 (Y-90) radioembolization treats liver tumors by delivering radioactive microspheres through the hepatic arteries. How well it works depends on where blood flow carries those microspheres — which is patient-specific and hard to predict. I build **physics-informed neural networks (PINNs)** that solve the Navier–Stokes equations for blood flow directly on patient-specific hepatic-artery geometries, validated against COMSOL CFD. The predicted flow split then feeds a dosimetry pipeline that converts microsphere transport into a three-dimensional absorbed-dose map (Gy).

To make this practical, I also train **geometry-aware neural operators** (a GINOT/DeepONet-style surrogate built on NVIDIA PhysicsNeMo) that predict flow and pressure for a new vessel geometry in seconds rather than hours, and I have wrapped the trained operator in an interactive digital-twin application. The goal is near-real-time, patient-specific treatment planning.

Scientific machine learning & neural operators
======
The methods above are part of a broader interest in **scientific machine learning** — making neural networks respect the physics they model. I work with forward and inverse PINNs, DeepONets and operator learning, and a range of architectures (Fourier-feature, modified- and multi-scale-Fourier, SIREN, and finite-basis FBPINNs) using PyTorch, DeepXDE, and NVIDIA PhysicsNeMo. Several open implementations are on my [portfolio](/portfolio/) and GitHub.

Conducting-polymer actuators for tactile feedback
======
*PhD research · University of British Columbia, with Dr. John Madden*

For my doctorate I studied **conducting-polymer (CP) actuators** — soft "artificial muscles" that bend when ions move in and out of a polymer. I built hybrid analytical + COMSOL finite-element models that predict their coupled ionic, electronic, and mechanical response, and characterized devices experimentally (electrochemical impedance spectroscopy, dynamic mechanical analysis, tensile testing). The aim was to make CP actuators fast and reliable enough for tactile-feedback and VR/AR applications. I also helped design and prototype a low-cost negative-pressure ventilator as part of a CAD$24M NSERC Alliance project.

Acoustofluidics & BioMEMS for exosome isolation
======
*MASc research · University of British Columbia, with Dr. Mina Hoorfar*

My master's work developed **acoustofluidic lab-on-a-chip devices** that use standing surface acoustic waves (SSAW / tilted-SSAW) to separate micron- and nano-scale particles — aimed at isolating extracellular vesicles such as exosomes for biomedical research. This combined cleanroom microfabrication (interdigital transducers, photolithography, PVD) with COMSOL multiphysics modeling and experimental validation.

Optical modeling for UV-C water purification
======
*Postdoctoral research · UBC — Safe Water Optics*

I modeled UV-C optical systems for water disinfection, combining ray tracing (LightTools, Zemax/OpticStudio) with PINN-based optical modeling and laboratory validation to optimize irradiance and system design.

Earlier work: tumor transport & imaging modeling
======
Earlier projects modeled **drug delivery and imaging in tumors** — image-based spatiotemporal models of drug transport through heterogeneous tumor vasculature, and computational modeling of PET-tracer distribution integrating microvasculature — connecting transport physics with medical imaging.

----

A complete list of outputs is on my [publications](/publications/) page, and code and demos are in my [portfolio](/portfolio/).
