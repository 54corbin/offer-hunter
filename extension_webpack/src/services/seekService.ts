export interface LocationSuggestion {
  text: string;
}

export async function fetchLocationSuggestions(query: string): Promise<LocationSuggestion[]> {
  if (!query) {
    return [];
  }

  const graphqlQuery = {
    operationName: "searchLocationsSuggest",
    variables: {
      query: query,
      count: 10,
      locale: "en-AU",
      country: "au",
    },
    query: `query searchLocationsSuggest($query: String!, $count: Int!, $locale: Locale, $country: CountryCodeIso2) {
      searchLocationsSuggest(query: $query, count: $count, locale: $locale, country: $country) {
        __typename
        suggestions {
          ... on LocationSuggestion {
            __typename
            text
          }
        }
      }
    }`,
  };

  try {
    const response = await fetch('https://www.seek.com.au/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(graphqlQuery),
    });

    if (!response.ok) {
      console.error('Failed to fetch location suggestions');
      return [];
    }

    const result = await response.json();
    const suggestions = result?.data?.searchLocationsSuggest?.suggestions || [];
    
    return suggestions
      .filter((s: any) => s.__typename === 'LocationSuggestion')
      .map((s: any) => ({ text: s.text }));

  } catch (error) {
    console.error('Error fetching location suggestions:', error);
    return [];
  }
}
