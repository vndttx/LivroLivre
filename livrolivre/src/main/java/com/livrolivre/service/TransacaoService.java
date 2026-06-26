package com.livrolivre.service;

import com.livrolivre.model.Transacao;
import com.livrolivre.model.enums.StatusTransacao;
import com.livrolivre.repository.TransacaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@Service
public class TransacaoService {

    @Autowired
    private TransacaoRepository transacaoRepository;

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

    public Transacao aceitarTransacao(String id) throws ExecutionException, InterruptedException {
        Transacao transacao = transacaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transação não encontrada"));
        transacao.setStatus(StatusTransacao.CONCLUIDA);
        return transacaoRepository.save(transacao);
    }

    public Transacao recusarTransacao(String id) throws ExecutionException, InterruptedException {
        Transacao transacao = transacaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transação não encontrada"));
        transacao.setStatus(StatusTransacao.CANCELADA);
        return transacaoRepository.save(transacao);
    }
}