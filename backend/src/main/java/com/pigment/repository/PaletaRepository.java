package com.pigment.repository;

import com.pigment.model.Paleta;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PaletaRepository extends MongoRepository<Paleta, String> {
}