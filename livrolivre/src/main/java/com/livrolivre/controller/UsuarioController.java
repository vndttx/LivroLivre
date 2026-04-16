package com.livrolivre.controller;

import com.livrolivre.controller.dto.LoginRequest;
import com.livrolivre.model.Usuario;
import com.livrolivre.repository.UsuarioRepository;
import com.livrolivre.service.UsuarioService;
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
    private UsuarioService usuarioService;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping
    @Transactional
    public ResponseEntity<?> cadastrar(@RequestBody @Valid LoginRequest dados) {
        var usuario = new Usuario(
                dados.email(),
                dados.nomeUsuario() != null ? dados.nomeUsuario() : dados.email(),
                passwordEncoder.encode(dados.senha())
        );

        usuarioRepository.save(usuario);
        return ResponseEntity.ok().build();
    }
}