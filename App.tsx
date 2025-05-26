import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, Button, Image, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Camera } from 'expo-camera';

const API_KEY = 'f24e1b2a';  

export default function App() {
  const [search, setSearch] = useState('batman');
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [fotoUri, setFotoUri] = useState(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();

    fetchDados(search);
  }, []);

  const fetchDados = async (titulo) => {
    if (!titulo) return;
    setLoading(true);
    try {
      const response = await fetch(`http://www.omdbapi.com/?apikey=${API_KEY}&s=${titulo}`);
      const json = await response.json();
      if (json.Search) {
        setDados(json.Search);
      } else {
        setDados([]);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const tirarFoto = async () => {
    if (cameraRef.current) {
      const foto = await cameraRef.current.takePictureAsync();
      setFotoUri(foto.uri);
    }
  };

  if (hasPermission === null) {
    return <Text>Solicitando permissão da câmera...</Text>;
  }
  if (hasPermission === false) {
    return <Text>Sem acesso à câmera.</Text>;
  }

  return (
    <View style={{ flex: 1, paddingTop: 40, paddingHorizontal: 10 }}>
      <Text style={styles.title}>Busca OMDb + Câmera</Text>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Digite título do filme"
          value={search}
          onChangeText={setSearch}
          style={styles.input}
        />
        <TouchableOpacity onPress={() => fetchDados(search)} style={styles.button}>
          <Text style={{ color: 'white' }}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : (
        <FlatList
          data={dados}
          keyExtractor={(item) => item.imdbID}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Image
                source={{ uri: item.Poster !== 'N/A' ? item.Poster : 'https://via.placeholder.com/100x150?text=No+Image' }}
                style={styles.poster}
              />
              <View style={{ flex: 1, paddingLeft: 10 }}>
                <Text style={{ fontWeight: 'bold' }}>{item.Title}</Text>
                <Text>{item.Year}</Text>
                <Text>{item.Type}</Text>
              </View>
            </View>
          )}
        />
      )}

      <View style={{ flex: 1, marginTop: 10 }}>
        <Camera ref={cameraRef} style={{ flex: 1 }} />

        <Button title="Tirar Foto" onPress={tirarFoto} />
        {fotoUri && (
          <Image source={{ uri: fotoUri }} style={{ width: 150, height: 150, alignSelf: 'center', marginTop: 10 }} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 4,
    paddingHorizontal: 10,
    height: 40,
  },
  button: {
    marginLeft: 10,
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    justifyContent: 'center',
    borderRadius: 4,
  },
  item: {
    flexDirection: 'row',
    marginBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
  },
  poster: {
    width: 100,
    height: 150,
  },
});
