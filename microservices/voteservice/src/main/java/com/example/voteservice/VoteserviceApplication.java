package com.example.voteservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients(basePackages = "com.example.voteservice.client")
public class VoteserviceApplication {
    public static void main(String[] args) {
        SpringApplication.run(VoteserviceApplication.class, args);
    }
}

