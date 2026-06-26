package com.livrolivre.service;

import com.livrolivre.model.Carrinho;
import com.livrolivre.model.Livro;
import com.livrolivre.repository.CarrinhoRepository;
import com.livrolivre.repository.LivroRepository;
import com.livrolivre.controller.dto.CarrinhoDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Service
public class CarrinhoService {

    @Autowired
    private CarrinhoRepository carrinhoRepository;

    @Autowired
    private LivroRepository livroRepository;

    public Carrinho adicionarAoCarrinho(String usuarioId, String livroId) {
        try {
            return carrinhoRepository.adicionarItem(usuarioId, livroId);
        } catch (ExecutionException | InterruptedException e) {
            throw new RuntimeException("Erro ao adicionar item ao carrinho", e);
        }
    }

    public CarrinhoDTO buscarPorUsuarioId(String usuarioId) {
        try {
            Carrinho carrinho = carrinhoRepository.findByUsuarioId(usuarioId).orElseGet(() -> {
                try {
                    return carrinhoRepository.save(new Carrinho(usuarioId));
                } catch (ExecutionException | InterruptedException e) {
                    throw new RuntimeException(e);
                }
            });

            List<Livro> livrosCompletos = new ArrayList<>();
            if (carrinho.getLivroIds() != null) {
                for (String id : carrinho.getLivroIds()) {
                    livroRepository.findById(id).ifPresent(livrosCompletos::add);
                }
            }

            return new CarrinhoDTO(carrinho.getUsuarioId(), livrosCompletos);
        } catch (ExecutionException | InterruptedException e) {
            throw new RuntimeException("Erro ao buscar carrinho", e);
        }
    }

    public CarrinhoDTO removerDoCarrinho(String usuarioId, String livroId) {
        try {
            carrinhoRepository.removerItem(usuarioId, livroId);
            return buscarPorUsuarioId(usuarioId);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao remover item do carrinho", e);
        }
    }
}