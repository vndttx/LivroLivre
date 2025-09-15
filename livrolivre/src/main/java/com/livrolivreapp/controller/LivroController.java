package com.livrolivreapp.controller;

import com.livrolivreapp.model.Livro;
import com.livrolivreapp.service.LivroService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/livros")
public class LivroController {

    @Autowired
    private LivroService livroService;

    @GetMapping
    public List<Livro> listar() {
        return livroService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Livro> buscarPorId(@PathVariable Long id) {
        return livroService.buscarPorId(id)
                .map(livro -> ResponseEntity.ok().body(livro))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Livro adicionar(@RequestBody Livro livro) {
        return livroService.salvar(livro);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Livro> atualizar(@PathVariable Long id, @RequestBody Livro livro) {
        if (!livroService.buscarPorId(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        livro.setId(id);
        Livro livroAtualizado = livroService.salvar(livro);
        return ResponseEntity.ok(livroAtualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (!livroService.buscarPorId(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        livroService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}