import React, { useState } from 'react';
import './App.css';

function Print({ name, A }) {
  return <p>{`${name}(${A.length - 1}) = [ ${A.join(' ')} ]`}</p>;
}

function generateCoefficients(n, k, q) {
    const numCoefficients = q ** (n - k); // q^(n-k)
  
    const coefficients = [];
    for(let l=1; l<q; l++){

    
    for (let i = 1; i < numCoefficients; ++i) {
      const coeff = new Array(n - k + 1).fill(0);
      coeff[n - k] = l;
  
      let temp = i;
      for (let j = 0; j < n - k; ++j) {
        coeff[j] = temp % q;
        temp = Math.floor(temp / q);
      }
      coefficients.push(coeff);
    }
}
  
    return coefficients;
  }
  

function encodeData(generator_polynomial, n, k, q, mssg) {
  const g_length = generator_polynomial.length;
  let encoded = [...generator_polynomial];
  for (let i = 0; i < n - g_length; ++i) {
    encoded.push(0);
  }

  const generator_matrix = [];
  for (let i = 0; i < k; ++i) {
    generator_matrix.push([...encoded]);
    encoded.unshift(encoded.pop());
  }

  const codeword = new Array(n).fill(0);
  for (let j = 0; j < generator_matrix[0].length; ++j) {
    let t = 0;
    for (let i = 0; i < k; ++i) {
      t = (t + (mssg[i] * generator_matrix[i][j]) % q) % q;
    }
    codeword[j] = t;
  }
  let output = '';
  for (let n of codeword) {
    output += n.toString();
  }
  return { encodedData: output, generatorMatrix: generator_matrix, generatorPolynomial: generator_polynomial };
}

function App() {
  const [n, setN] = useState('');
  const [k, setK] = useState('');
  const [v, setV] = useState('');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);
  const [generatorGenerated, setGeneratorGenerated] = useState(false); // Track if generator matrix and polynomial are generated

  const handleGeneratorClick = (e) => {
    e.preventDefault();

    const nVal = parseInt(n);
    const kVal = parseInt(k);
    const vVal = parseInt(v);
    const poss = generateCoefficients(nVal, kVal, v);

    console.log(poss)

    let ans = [];

    for (let y = 0; y < poss.length; y++) {
      let N = [], D = [], d = [], q = [], r = [];
      let dN, dD, dd, dq, dr;
      let i;

      dN = nVal;
      dD = nVal - kVal;
      dq = dN - dD;
      dr = dN - dD;

      if (dD < 1 || dN < 1) {
        console.error("Error: degree of D and N must be positive.");
        return;
      }

      N = Array.from({ length: dN + 1 }, (_, i) => (i === 0 || i === dN) ? 1 : 0);
      N[0] = -1;

      D = poss[y].slice(0, dD + 1);

      d = Array.from({ length: dN + 1 }, () => 0);
      q = Array.from({ length: dq + 1 }, () => 0);
      r = Array.from({ length: dr + 1 }, () => 0);

      if (dN >= dD) {
        while (dN >= dD) {
          d.fill(0);
          for (i = 0; i <= dD; i++)
            d[i + dN - dD] = D[i];
          dd = dN;

          q[dN - dD] = Math.floor(N[dN] / d[dd]);

          for (i = 0; i < dq + 1; i++)
            d[i] = d[i] * q[dN - dD];

          for (i = 0; i < dN + 1; i++)
            N[i] = N[i] - d[i];
          dN--;
        }
      }

      for (i = 0; i <= dN; i++)
        r[i] = N[i];

      let flag = true;
      for (let w = 0; w < r.length; w++) {
        if (r[w] % vVal !== 0)
          flag = false;
      }
      if (flag === true) {
        ans.push(D);
      }
    }

    if (ans.length === 0) {
      setResult({ error: "No polynomial found." });
      return;
    }
    console.log(ans)
    const generator_polynomial = ans[0];
    setResult({ generatorPolynomial: generator_polynomial });
    setGeneratorGenerated(true);
  };

  const handleEncodeClick = (e) => {
    e.preventDefault();

    const nVal = parseInt(n);
    const kVal = parseInt(k);
    const vVal = parseInt(v);
    const mssg = message.split(' ').map(val => parseInt(val));

    if (!generatorGenerated) {
      setResult({ error: "Generate the generator matrix and polynomial first." });
      return;
    }

    const { encodedData, generatorMatrix, generatorPolynomial } = encodeData(result.generatorPolynomial, nVal, kVal, vVal, mssg);
    setResult({ encodedData, generatorMatrix, generatorPolynomial });
  };

  const formatPolynomial = (polynomial) => {
    let formattedPolynomial = '';
    polynomial?.forEach((coeff, index) => {
      if (coeff !== 0) {
        if (formattedPolynomial !== '') {
          formattedPolynomial += ' + ';
        }
        if (index === 0) {
          formattedPolynomial += `${coeff}`;
        } else {
          if (index === 1) {
            formattedPolynomial += `${coeff}x`;
          } else {
            formattedPolynomial += `${coeff}x<sup>${index}</sup>`;
          }
        }
      }
    });
    return formattedPolynomial;
  };

  return (
    <div className="App mx-auto max-w-lg p-6 bg-white rounded-lg shadow-lg">
  <h1 className="text-4xl font-bold mb-8 text-center text-blue-600">
    Cyclic Code Encoder
  </h1>
  <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
  <form>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div>
        <label htmlFor="n" className="block text-gray-700 font-semibold mb-2">
          n:
        </label>
        <input
          id="n"
          type="number"
          min="1"
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter value for n"
          value={n}
          onChange={(e) => setN(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="k" className="block text-gray-700 font-semibold mb-2">
          k:
        </label>
        <input
          id="k"
          type="number"
          min="1"
          max={n - 1}
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter value for k"
          value={k}
          onChange={(e) => setK(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="v" className="block text-gray-700 font-semibold mb-2">
          q:
        </label>
        <input
          id="v"
          type="number"
          min="1"
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter value for v"
          value={v}
          onChange={(e) => setV(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-gray-700 font-semibold mb-2">
          Message:
        </label>
        <input
          id="message"
          type="text"
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
    </div>
    <div className="flex justify-center">
      <button
        className="px-6 py-3 mr-4 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={handleGeneratorClick}
        disabled={!n || !k || !v}
      >
        Generate Polynomial
      </button>
      <button
        className="px-6 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={handleEncodeClick}
        disabled={!n || !k || !v || !message}
      >
        Encode Message
      </button>
    </div>
  </form>
</div>
  {result && result.error && (
    <div className="text-red-600 mt-6 text-center font-semibold">
      {result.error}
    </div>
  )}
  {result && result.generatorPolynomial && (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 text-blue-600">
        Generator Polynomial:
      </h2>
      <p
        className="whitespace-pre-wrap break-words border border-gray-300 p-4 rounded-md bg-gray-100 shadow-md"
        dangerouslySetInnerHTML={{
          __html: formatPolynomial(result.generatorPolynomial),
        }}
      ></p>
    </div>
  )}
  {result && result.generatorMatrix && (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 text-blue-600">
        Generator Matrix:
      </h2>
      <div className="border border-gray-300 p-4 rounded-md bg-gray-100 shadow-md">
        {result.generatorMatrix.map((row, rowIndex) => (
          <div key={rowIndex} className="flex flex-wrap items-center justify-center mb-2">
            {row.map((cell, cellIndex) => (
              <span
                key={cellIndex}
                className="mr-2 px-2 py-1 bg-white rounded-md shadow-sm"
              >
                {cell}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )}
  {result && result.encodedData && !isNaN(parseInt(result.encodedData)) && (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 text-blue-600">Encoded Data:</h2>
      <p className="break-words p-4 rounded-md bg-gray-100 shadow-md">
        {result.encodedData}
      </p>
    </div>
  )}
</div>


  );
}

export default App;
