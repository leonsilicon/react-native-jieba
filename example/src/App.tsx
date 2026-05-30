import { useEffect, useState } from 'react';
import { Platform, ScrollView, Text, View, StyleSheet } from 'react-native';
import {
  cut,
  cutAll,
  cutForSearch,
  tag,
  extract,
  initJieba,
} from 'react-native-jieba';

const sentence = '我来到北京清华大学';
const longer = '小明硕士毕业于中国科学院计算所，后在日本京都大学深造';
const tagSentence =
  '我是拖拉机学院手扶拖拉机专业的。不用多久，我就会升职加薪，当上CEO，走上人生巅峰。';

type Results = {
  cut: string;
  cutAll: string;
  cutForSearch: string;
  tag: string;
  extract: string;
};

function Section({ title, value }: { title: string; value: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value} testID={`value-${title}`}>
        {value}
      </Text>
    </View>
  );
}

export default function App() {
  const [results, setResults] = useState<Results | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initJieba()
      .then(() => {
        setResults({
          cut: cut(sentence).join(' / '),
          cutAll: cutAll(sentence).join(' / '),
          cutForSearch: cutForSearch(longer).join(' / '),
          tag: tag(tagSentence)
            .map((t) => `${t.word}:${t.tag}`)
            .join(' '),
          // extract (TF-IDF) is unavailable on web (jieba-wasm ships no IDF dict).
          extract:
            Platform.OS === 'web'
              ? 'n/a on web'
              : extract(tagSentence, 5)
                  .map((k) => `${k.word} (${k.weight.toFixed(2)})`)
                  .join(', '),
        });
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>react-native-jieba</Text>
      {error && (
        <Text style={styles.error} testID="error">
          {error}
        </Text>
      )}
      {!results && !error && <Text>Initializing…</Text>}
      {results && (
        <>
          <Section title="Cut" value={results.cut} />
          <Section title="CutAll" value={results.cutAll} />
          <Section title="CutForSearch" value={results.cutForSearch} />
          <Section title="Tag" value={results.tag} />
          <Section title="Extract" value={results.extract} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 64,
  },
  heading: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    color: '#111',
  },
  error: {
    color: 'red',
    fontSize: 14,
  },
});
