package com.livrolivre.service;

import com.livrolivre.model.Livro;
import com.livrolivre.repository.LivroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@Service
public class LivroService {

    @Autowired
    private LivroRepository livroRepository;

    public List<Livro> findAll() {
        try {
            return livroRepository.findAll();
        } catch (ExecutionException | InterruptedException e) {
            throw new RuntimeException("Erro ao listar livros no Firebase", e);
        }
    }

    public Optional<Livro> findById(String id) {
        try {
            return livroRepository.findById(id);
        } catch (ExecutionException | InterruptedException e) {
            throw new RuntimeException("Erro ao buscar livro por ID no Firebase", e);
        }
    }

    public Livro save(Livro livro) {
        try {
            return livroRepository.save(livro);
        } catch (ExecutionException | InterruptedException e) {
            throw new RuntimeException("Erro ao salvar livro no Firebase", e);
        }
    }

    public List<Livro> findByUsuarioId(String usuarioId) throws ExecutionException, InterruptedException {
        return livroRepository.findByProprietarioId(usuarioId);
    }

    public void deleteById(String id) throws java.util.concurrent.ExecutionException, InterruptedException {
        livroRepository.deleteById(id);
    }

}