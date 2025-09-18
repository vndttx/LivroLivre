package com.livrolivre.repository;

import com.livrolivre.model.Transacao;
import com.livrolivre.model.Usuario; // Adicione este import
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List; // Adicione este import

@Repository
public interface TransacaoRepository extends JpaRepository<Transacao, Long> {
    List<Transacao> findBySolicitanteOrderByDataDesc(Usuario solicitante);

}