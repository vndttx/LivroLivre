package com.livrolivre.controller;

import com.livrolivre.model.Usuario;
import com.livrolivre.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping
    public ResponseEntity<Usuario> salvar(@RequestBody Usuario usuario) {
        try {
            Usuario novoUsuario = usuarioService.salvar(usuario);
            return new ResponseEntity<>(novoUsuario, HttpStatus.CREATED);
        } catch (DataIntegrityViolationException e) {
            // Mensagem de erro sem acento
            return ResponseEntity.badRequest().body(null);
        }
    }
}