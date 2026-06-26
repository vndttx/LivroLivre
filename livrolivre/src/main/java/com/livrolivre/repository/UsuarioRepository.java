package com.livrolivre.repository;

import com.google.cloud.firestore.*;
import com.livrolivre.model.Usuario;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@Repository
public class UsuarioRepository {

    private final CollectionReference collection;

    public UsuarioRepository(Firestore firestore) {
        this.collection = firestore.collection("usuarios");
    }

    public Usuario save(Usuario usuario) throws ExecutionException, InterruptedException {
        if (usuario.getId() == null || usuario.getId().isEmpty()) {
            DocumentReference docRef = collection.document();
            usuario.setId(docRef.getId());
        }
        collection.document(usuario.getId()).set(usuario).get();
        return usuario;
    }

    public Optional<Usuario> findById(String id) throws ExecutionException, InterruptedException {
        DocumentSnapshot snapshot = collection.document(id).get().get();
        if (snapshot.exists()) {
            return Optional.of(snapshot.toObject(Usuario.class));
        }
        return Optional.empty();
    }

    public Optional<Usuario> findByEmail(String email) throws ExecutionException, InterruptedException {
        QuerySnapshot snapshot = collection.whereEqualTo("email", email).get().get();
        if (!snapshot.isEmpty()) {
            return Optional.of(snapshot.getDocuments().get(0).toObject(Usuario.class));
        }
        return Optional.empty();
    }
}