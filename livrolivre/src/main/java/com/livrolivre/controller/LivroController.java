package com.livrolivre.controller;

import com.livrolivre.model.Livro;
import com.livrolivre.model.Usuario;
import com.livrolivre.model.enums.StatusLivro;
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

    private Usuario getUsuarioLogado(Principal principal) {
        if (principal == null || principal.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario nao autenticado.");
        }
        return usuarioRepository.findByNomeUsuario(principal.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario nao encontrado"));
    }

    @GetMapping
    public List<Livro> listarTodos() {
        return livroService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Livro> buscarPorId(@PathVariable Long id) {
        return livroService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Livro> cadastrar(@RequestBody Livro livro, Principal principal) {
        Usuario proprietario = getUsuarioLogado(principal);

        livro.setProprietario(proprietario);
        if (livro.getStatus() == null) {
            livro.setStatus(StatusLivro.DISPONIVEL);
        }

        Livro novoLivro = livroService.salvar(livro);
        return ResponseEntity.ok(novoLivro);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        livroService.remover(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/meus-livros")
    public ResponseEntity<List<Livro>> listarMeusLivros(Principal principal) {
        Usuario proprietario = getUsuarioLogado(principal);

        List<Livro> meusLivros = livroService.buscarPorProprietario(proprietario);
        return ResponseEntity.ok(meusLivros);
    }
}