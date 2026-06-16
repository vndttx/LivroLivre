package com.livrolivre.controller;

import com.livrolivre.controller.dto.LoginRequest;
import com.livrolivre.model.Usuario;
import com.livrolivre.repository.UsuarioRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioRepository repository;
    @Autowired
    private PasswordEncoder encoder;

    @PostMapping
    @Transactional
    public ResponseEntity<?> cadastrar(@RequestBody @Valid LoginRequest dados) {
        if (repository.findByEmail(dados.email()).isPresent()) {
            return ResponseEntity.badRequest().body("E-mail ja cadastrado.");
        }
        var usuario = new Usuario(dados.email(), dados.nomeUsuario(), encoder.encode(dados.senha()));
        repository.save(usuario);
        return ResponseEntity.ok().build();
    }
}