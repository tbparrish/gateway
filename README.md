# Gateway

Gateway is the consumer facing api. Its responsibility is to act as a proxy service between the outside world and the internal micro-services. Behaviors are implemented as middleware.

Current implemented middleware:

Proxy: proxies requests to internal micro-services using config/routes.json configuration

### Prerequisites

* node
* npm

### Install

`npm install` in the application root

### Run

`npm start` in the application root
