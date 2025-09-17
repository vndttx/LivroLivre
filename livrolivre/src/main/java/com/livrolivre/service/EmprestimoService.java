package com.livrolivre.service;

import com.livrolivre.model.Emprestimo;
import com.livrolivre.model.Livro;
import com.livrolivre.repository.EmprestimoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EmprestimoService {

    @Autowired
    private EmprestimoRepository emprestimoRepository;

    @Autowired
    private LivroService livroService;

    // Adiciona um livro ao carrinho ou incrementa a quantidade
    public Optional<Emprestimo> adicionarLivro(Long usuarioId, Long livroId, int quantidade) {
        Optional<Emprestimo> emprestimoExistente = emprestimoRepository.findByUsuarioIdAndLivroId(usuarioId, livroId);

        if (emprestimoExistente.isPresent()) {
            Emprestimo emprestimo = emprestimoExistente.get();
            emprestimo.setQuantidade(emprestimo.getQuantidade() + quantidade);
            return Optional.of(emprestimoRepository.save(emprestimo));
        } else {
            Optional<Livro> livroOptional = livroService.buscarPorId(livroId);
            if (livroOptional.isPresent()) {
                Livro livro = livroOptional.get();
                Emprestimo novoEmprestimo = new Emprestimo();
                novoEmprestimo.setUsuario(new com.livrolivre.model.Usuario()); // Cria um usuário temporário para associação
                novoEmprestimo.getUsuario().setId(usuarioId);
                novoEmprestimo.setLivro(livro);
                novoEmprestimo.setQuantidade(quantidade);
                return Optional.of(emprestimoRepository.save(novoEmprestimo));
            }
        }
        return Optional.empty();
    }

    // Lista todos os itens do carrinho de um usuário
    public List<Emprestimo> listarPorUsuario(Long usuarioId) {
        return emprestimoRepository.findByUsuarioId(usuarioId);
    }

    // Remove um item do carrinho
    public void removerDoCarrinho(Long emprestimoId) {
        emprestimoRepository.deleteById(emprestimoId);
    }
}