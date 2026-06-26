package com.livrolivre.repository;

import com.google.cloud.firestore.*;
import com.livrolivre.model.Carrinho;
import org.springframework.stereotype.Repository;
import java.util.ArrayList;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@Repository
public class CarrinhoRepository {

    private final CollectionReference collection;

    public CarrinhoRepository(Firestore firestore) {
        this.collection = firestore.collection("carrinhos");
    }

    public Carrinho save(Carrinho carrinho) throws ExecutionException, InterruptedException {
        collection.document(carrinho.getUsuarioId()).set(carrinho).get();
        return carrinho;
    }

    public Optional<Carrinho> findByUsuarioId(String usuarioId) throws ExecutionException, InterruptedException {
        DocumentSnapshot snapshot = collection.document(usuarioId).get().get();
        if (snapshot.exists()) {
            Carrinho carrinho = snapshot.toObject(Carrinho.class);
            if (carrinho != null && carrinho.getLivroIds() == null) {
                carrinho.setLivroIds(new ArrayList<>());
            }
            return Optional.ofNullable(carrinho);
        }
        return Optional.empty();
    }

    public Carrinho adicionarItem(String usuarioId, String livroId) throws ExecutionException, InterruptedException {
        Carrinho carrinho = findByUsuarioId(usuarioId).orElse(new Carrinho(usuarioId));
        if (!carrinho.getLivroIds().contains(livroId)) {
            carrinho.getLivroIds().add(livroId);
        }
        return save(carrinho);
    }

    public Carrinho removerItem(String usuarioId, String livroId) throws ExecutionException, InterruptedException {
        Carrinho carrinho = findByUsuarioId(usuarioId).orElse(new Carrinho(usuarioId));
        if (carrinho.getLivroIds() != null) {
            carrinho.getLivroIds().remove(livroId);
        }
        return save(carrinho);
    }
}