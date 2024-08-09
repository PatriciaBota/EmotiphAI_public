# EmotiphAI_public

**EmotiphAI** is a platform developed to address the challenge of collecting physiological data from groups, particularly when there are limited devices available.

## Overview

The platform is designed not only for real-time biosignal acquisition but also for retrospective emotion annotation. By analyzing Electrodermal Activity (EDA) data, EmotiphAI identifies significant moments in a session (e.g., during a 2-hour movie), allowing for targeted annotation. This approach minimizes distraction during the emotion elicitation process, making it more efficient and user-friendly.

## Methods

EmotiphAI is built on a low-cost, standalone local infrastructure, which includes:

- **Hardware**:
  - A local hub, such as a Raspberry Pi or Odroid, that serves as the central data receiver.
  - A wearable device, 3D-printed and based on the ESP32 microcontroller, for biosignal acquisition.

- **Communication**:
  - Data is transmitted via Bluetooth to the local hub, which is connected through a WiFi router (e.g., TP-Link Wireless N 450Mbps (TL-WR940N)).
  - Multiprocessing is employed to manage simultaneous data reception from multiple devices while optimizing CPU core usage.

- **Software**:
  - An end-user interface for real-time data visualization and emotion annotation.

For detailed methodology and technical specifications, refer to the scientific paper [available here](https://link.springer.com/article/10.1007/s00521-022-07191-8).

## Results

The EmotiphAI platform can:

- Collect data from up to **30 devices at 50Hz** (1 channel), or **10 devices at 100Hz** (2 channels).
- The platform was successfully used to collect a real-world dataset, comprising over **350 hours** of data. This dataset is publicly available [here](https://github.com/PatriciaBota/g-rex_public).
- Scientific paper available [here](https://link.springer.com/article/10.1007/s00521-022-07191-8).

<div align="center">
  <img src="static/images/emotiphai_infrastructure.png" alt="emotiphai_infrastructure" width="500"/>
</div>

## DEMOs
<div style="display: flex; justify-content: center; align-items: center;">
  <img src="static/images/aquisition.gif" alt="Aquisition" width="400"/>
  <img src="static/images/annotation.gif" alt="Annotation" width="400"/>
</div>

## Installation
Installation can be easily done with the `Clone or Download` button above:

```bash
$ git clone https://github.com/PatriciaBota/EmotiphAI.git
```

## Configuration
- Configurations can be found at fastapi/src/core/config.py

## Run
1. make create-venv
1. make install
2. make run

To get started with EmotiphAI:

1. Set up the local infrastructure with the required hardware and software.
2. Deploy the wearable devices to participants.
3. Use the platform's interface to monitor and annotate data in real-time or retrospectively.

## Acknowledge
This work was funded by FCT - Fundação para a Ciência e a Tecnologia under grants 2020.06675.BD and FCT (PCIF/SSO/0163/2019 SafeFire), FCT/MCTES national funds, co-funded EU (UIDB/50008/2020 NICE-HOME), Xinhua Net FMCI (S-0003-LX-18), Ministry of Economy and Competitiveness of the Spanish Government co-founded by ERDF (TIN2017-85409-P PhysComp), and IT - Instituto de Telecomunicacações, by the European Regional Development Fund (FEDER) through the Operational Competitiveness and Internationalization Programme (COMPETE 2020), and by National Funds (OE) through the FCT under the LISBOA-01-0247-FEDER-069918 “CardioLeather” and LISBOA-1-0247-FEDER-113480 “EpilFootSense”.
