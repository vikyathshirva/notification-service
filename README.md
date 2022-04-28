<div id="top"></div>



<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->




<!-- PROJECT LOGO -->
<br />
<div align="center">


  <h3 align="left">Notification Service</h3>


</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
      </ul>
    </li>
  
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

[![Product Name Screen Shot][product-screenshot]](https://example.com)

A simple notification service built with Node.js and Kafka.


<p align="right">(<a href="#top">back to top</a>)</p>



### Built With

This section should list any major frameworks/libraries used to bootstrap your project. Leave any add-ons/plugins for the acknowledgements section. Here are a few examples.

* [Node.js](https://nodejs.org/en/)
* [Typescript](https://www.typescriptlang.org)
* [Kafka](https://kafka.apache.org)
* [Docker](https://www.docker.com)
* [avsc](https://avro.apache.org/docs/current/spec.html)
* [Mocha](https://mochajs.org)


<p align="right">(<a href="#top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

This is an test project which isn't fully implemented yet, the goal is to reach a fully scalable notification service,
the tests are still not implemented yet, because I fell short of time, built a custom error handler to go along with it, too. The kafka system isn't configured yet, and some of the components such as notification logger are yet to be done.
The motivation to use kafka is that it much intuitive to build a dead letter queue with it, which is for retrying notification when thrird party services are down, and also it
can be made to work as a queue and a broadcaster, and a lot of configuration opportunities for scaling


### Prerequisites

For running this we would need Node ,Kafka (need docker for the kafka instance)

  1.  just run the following command to install all the dependencies
  ```sh
  npm install
  ```
2.  run the docker file to set up the kafka instances
  ```sh
  docker-compose up
  ```
3.  
  ```sh
  docker-compose up
  ```




<p align="right">(<a href="#top">back to top</a>)</p>





[product-screenshot]: images/sysDes.png