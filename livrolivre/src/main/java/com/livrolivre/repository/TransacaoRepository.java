package com.livrolivre.repository;

import com.livrolivre.model.Transacao;
import com.livrolivre.model.Usuario;
import com.livrolivre.model.enums.StatusTransacao;
import com.livrolivre.model.enums.TipoTransacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransacaoRepository extends JpaRepository<Transacao, Long> {

    List<Transacao> findBySolicitanteOrderByDataDesc(Usuario solicitante);

    List<Transacao> findByProprietarioAndTipoAndStatusOrderByDataDesc(
            Usuario proprietario,
            TipoTransacao tipo,
            StatusTransacao status
    );
}