package com.livrolivre.controller;

import com.livrolivre.model.Usuario;
import com.livrolivre.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping
    public ResponseEntity<?> cadastrarUsuario(@RequestBody Usuario usuario) {
        if (usuarioService.buscarPorNomeUsuario(usuario.getNomeUsuario()).isPresent()) {
            return ResponseEntity.badRequest().body("Nome de usuario ja existe.");
        }
        Usuario novoUsuario = usuarioService.salvar(usuario);
        return ResponseEntity.ok(novoUsuario);
    }
}