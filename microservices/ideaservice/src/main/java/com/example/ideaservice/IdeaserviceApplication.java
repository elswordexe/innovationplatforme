package com.example.ideaservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients(basePackages = "com.example.ideaservice.client")
public class IdeaserviceApplication {

    public static void main(String[] args) {
        SpringApplication.run(IdeaserviceApplication.class, args);
    }

}
