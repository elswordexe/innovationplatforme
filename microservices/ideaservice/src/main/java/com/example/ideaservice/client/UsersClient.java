package com.example.ideaservice.client;

import com.example.ideaservice.client.dto.UserSummary;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "userservice", path = "/api/users")
public interface UsersClient {

    @GetMapping("/{id}")
    UserSummary getById(@PathVariable("id") Long id);

    @GetMapping("/by-email")
    UserSummary getByEmail(@RequestParam("email") String email);
}
