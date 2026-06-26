package com.livrolivre.controller;

import com.livrolivre.model.Livro;
import com.livrolivre.model.Usuario;
import com.livrolivre.repository.UsuarioRepository;
import com.livrolivre.service.LivroService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/livros")
public class LivroController {

    @Autowired
    private LivroService livroService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @GetMapping
    public ResponseEntity<List<Livro>> listarTodos() {
        return ResponseEntity.ok(livroService.findAll());
    }

    @PostMapping
    public ResponseEntity<Livro> criarLivro(@RequestBody Livro livro, @RequestHeader("X-Usuario-Id") String usuarioId) {
        try {
            Usuario proprietario = usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));
            livro.setProprietario(proprietario);
            return ResponseEntity.status(HttpStatus.CREATED).body(livroService.save(livro));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Erro ao associar proprietário do livro.", e);
        }
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Livro>> listarPorUsuario(@PathVariable String usuarioId) {
        try {
            return ResponseEntity.ok(livroService.findByUsuarioId(usuarioId));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Erro ao buscar livros do usuario.", e);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removerLivro(@PathVariable String id) {
        try {
            livroService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Erro ao remover livro.", e);
        }
    }

    private Usuario getUsuarioLogado(Principal principal) {
        if (principal == null || principal.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado.");
        }
        try {
            return usuarioRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));
        } catch (java.util.concurrent.ExecutionException | InterruptedException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao buscar usuário no Firebase", e);
        }
    }
}