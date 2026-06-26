package com.livrolivre.controller;

import com.livrolivre.controller.dto.LoginRequest;
import com.livrolivre.model.Usuario;
import com.livrolivre.repository.UsuarioRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/autenticacao")
public class AutenticacaoController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UsuarioRepository repository;

    @PostMapping("/login")
    public ResponseEntity<?> autenticar(@RequestBody @Valid LoginRequest dados) {
        try {
            var authenticationToken = new UsernamePasswordAuthenticationToken(dados.email(), dados.senha());
            var authentication = authenticationManager.authenticate(authenticationToken);

            var userDetails = (org.springframework.security.core.userdetails.User) authentication.getPrincipal();
            var usuario = repository.findByEmail(userDetails.getUsername()).orElseThrow();

            String tokenAlternativo = UUID.randomUUID().toString();

            return ResponseEntity.ok(Map.of(
                    "token", tokenAlternativo,
                    "id", usuario.getId(),
                    "nomeUsuario", usuario.getNomeUsuario(),
                    "email", usuario.getEmail()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("E-mail ou senha incorretos.");
        }
    }
}