package com.livrolivre.service;

import com.livrolivre.model.Transacao;
import com.livrolivre.model.Livro;
import com.livrolivre.model.enums.StatusTransacao;
import com.livrolivre.model.enums.TipoTransacao;
import com.livrolivre.repository.TransacaoRepository;
import com.livrolivre.repository.LivroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class TransacaoService {

    @Autowired
    private TransacaoRepository transacaoRepository;

    @Autowired
    private LivroRepository livroRepository;

    public Transacao salvarProposta(Transacao transacao) {
        try {
            transacao.setStatus(StatusTransacao.PENDENTE);
            return transacaoRepository.save(transacao);
        } catch (ExecutionException | InterruptedException e) {
            throw new RuntimeException("Erro ao salvar proposta", e);
        }
    }

    public Optional<Transacao> buscarPorId(String id) {
        try {
            return transacaoRepository.findById(id);
        } catch (ExecutionException | InterruptedException e) {
            throw new RuntimeException("Erro ao buscar transação", e);
        }
    }

    public List<Transacao> buscarPorUsuarioDestinatario(String usuarioId) {
        try {
            return transacaoRepository.findByDestinatarioId(usuarioId);
        } catch (ExecutionException | InterruptedException e) {
            throw new RuntimeException("Erro ao buscar transações por destinatário", e);
        }
    }

    public List<Transacao> buscarHistoricoPorUsuario(String usuarioId) {
        try {
            List<Transacao> comoDestinatario = transacaoRepository.findByDestinatarioId(usuarioId);
            List<Transacao> comoSolicitante = transacaoRepository.findBySolicitanteId(usuarioId);
            return Stream.concat(comoDestinatario.stream(), comoSolicitante.stream())
                    .distinct()
                    .collect(Collectors.toList());
        } catch (ExecutionException | InterruptedException e) {
            throw new RuntimeException("Erro ao buscar histórico unificado do usuário", e);
        }
    }

    public Transacao aceitarTransacao(String id) throws ExecutionException, InterruptedException {
        Transacao transacao = transacaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transação não encontrada"));

        transacao.setStatus(StatusTransacao.CONCLUIDA);

        if (transacao.getLivroSolicitado() != null && transacao.getLivroSolicitado().getId() != null) {
            Optional<Livro> livroOpt = livroRepository.findById(transacao.getLivroSolicitado().getId());
            if (livroOpt.isPresent()) {
                Livro livro = livroOpt.get();
                int novoEstoque = livro.getEstoque() - 1;
                if (novoEstoque <= 0) {
                    livroRepository.deleteById(livro.getId());
                } else {
                    livro.setEstoque(novoEstoque);
                    livroRepository.save(livro);
                }
            }
        }

        if (transacao.getTipo() == TipoTransacao.TROCA && transacao.getLivroOfertado() != null && transacao.getLivroOfertado().getId() != null) {
            Optional<Livro> livroOfOpt = livroRepository.findById(transacao.getLivroOfertado().getId());
            if (livroOfOpt.isPresent()) {
                Livro livroOf = livroOfOpt.get();
                int novoEstoqueOf = livroOf.getEstoque() - 1;
                if (novoEstoqueOf <= 0) {
                    livroRepository.deleteById(livroOf.getId());
                } else {
                    livroOf.setEstoque(novoEstoqueOf);
                    livroRepository.save(livroOf);
                }
            }
        }

        return transacaoRepository.save(transacao);
    }

    public Transacao recusarTransacao(String id) throws ExecutionException, InterruptedException {
        Transacao transacao = transacaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transação não encontrada"));
        transacao.setStatus(StatusTransacao.CANCELADA);
        return transacaoRepository.save(transacao);
    }
}