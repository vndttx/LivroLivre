package com.livrolivre.model;

import com.livrolivre.model.enums.StatusTransacao;
import com.livrolivre.model.enums.TipoTransacao;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transacao {
    private String id;
    private Usuario solicitante;
    private Usuario destinatario;
    private Usuario proprietario;
    private Livro livroSolicitado;
    private Livro livroOfertado;
    private TipoTransacao tipo;
    private StatusTransacao status;
    private LocalDateTime data;
}