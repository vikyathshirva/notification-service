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


  <h1 align="left">Notification Service</h1>


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
3.  To make sure kafka receive the notification events to its broker which is split by topics you need to create the few topics to is

  ```sh
  docker exec -it kafka /opt/bitnami/kafka/bin/kafka-topics.sh \
    --create \
    --bootstrap-server localhost:9092 \
    --replication-factor 1 \
    --partitions 1 \
    --topic test
  ```
   ```sh
  docker exec -it kafka /opt/bitnami/kafka/bin/kafka-topics.sh \
    --create \
    --bootstrap-server localhost:9092 \
    --replication-factor 1 \
    --partitions 2 \
    --topic sms
  ```
  ```sh
    docker exec -it kafka /opt/bitnami/kafka/bin/kafka-topics.sh \
    --create \
    --bootstrap-server localhost:9092 \
    --replication-factor 1 \
    --partitions 2 \
    --topic whatsapp
  ```
  ```sh
    docker exec -it kafka /opt/bitnami/kafka/bin/kafka-topics.sh \
    --create \
    --bootstrap-server localhost:9092 \
    --replication-factor 1 \
    --partitions 2 \
    --topic emai
  ```
 4 This application exposes just one endpoint that is
   ```sh
    api/v1/notification
  ```
  send data as the body of the request
   ```sh
   {
    "medium" : ["whatsApp"], // [ array of string ]
    "schedule" : [12,"s"], // [ schedule ]]
    "adhc" : true, // boolean
    "userId" : "*", // string
    "group" : ["A"] // [array of string]
    }
  ```
```sh
    "medium" 

    add vendors here like whatsapp sms etc 
    ex :['whatsApp']
    
  ```
```sh
    "schedule" 

    Set a schedule so the notification can be Set as a cron job, in order to use this set adhc to false
    ex :[1,"d","m"], minimum number of variables 2, max 3
    the following example is read as for the first day of the month
    ex : [1,"m"] read as once a month
  ```

  ```sh
    "adhc" 

      boolean value that determines wether the mode is ad hoc or not, setting this to true would override schedule option, as adhc would take precedence.
      ex : true , setting this to true would send it in an ad hoc manner every time the request is sent
  ```
  ```sh
    "userId" 

      set the userId you want to trigger the notification event for. Type conforms to a String, sets only one vairable
      ex : "kahsd9213" a random userId that is known prior to sending the request
  ```
  ```sh
    "group" 

      Takes in a array of strings , which is associated with each user, this logically groups users into groups. used for setting the events in bullk.
      ex : ["A", "B"] read as send a notification event to every user that belongs to group A and B
  ```
  

  
  




<p align="right">(<a href="#top">back to top</a>)</p>





[product-screenshot]: images/sysDes.png