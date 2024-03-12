function renderTransactions(transactionData) {
  const transaction = document.createElement("div");
  transaction.classList.add("transaction");
  transaction.id = `transaction+${transactionData.id}`;

  const divTransactionType = document.createElement("div");
  divTransactionType.classList.add("opType");
  divTransactionType.textContent = "Tipo:";

  const spanTransactionType = document.createElement("span");
  spanTransactionType.classList.add("operation-type");
  spanTransactionType.textContent = transactionData.opType;

  const divDescription = document.createElement("div");
  divDescription.classList.add("description");
  divDescription.textContent = "Descrição:";

  const spanDescription = document.createElement("span");
  spanDescription.classList.add("transactionDescription");
  spanDescription.textContent = transactionData.description;

  const divValue = document.createElement("div");
  divValue.classList.add("value");
  divValue.textContent = "Valor: R$ ";

  const spanValue = document.createElement("span");
  spanValue.classList.add("transactionValue");
  spanValue.textContent = `${transactionData.value}`;

  const buttonEdit = document.createElement("button");
  buttonEdit.classList.add("btn-edit");
  buttonEdit.id = `edit-${transactionData.id}`;
  buttonEdit.textContent = "Editar";
  buttonEdit.type = "button";
  buttonEdit.addEventListener("click", () => {
    if (buttonEdit.type === "button") {
      buttonEdit.type = "submit";
      buttonEdit.textContent = "Salvar";
      spanTransactionType.innerHTML = `<select name="entrada" id="newOpType">
                                            <option value="entrada">Entrada</option>
                                            <option value="saida">Saida</option>
                                      </select>`;
      spanDescription.innerHTML = `<input type='text' id='newDesc' value='${transactionData.description}'>`;
      spanValue.innerHTML = `<input type='number' id='newValue' value='${transactionData.value}'>`;
    } else {
      editTransaction(transactionData.id);
      buttonEdit.type = "button";
      buttonEdit.textContent = "Editar";
      spanTransactionType.textContent = transactionData.opType;
      spanDescription.textContent = transactionData.description;
      spanValue.textContent = `${transactionData.value}`;
    }
  });

  const buttonDelete = document.createElement("button");
  buttonDelete.classList.add("btn-delete");
  buttonDelete.id = `delete-${transactionData.id}`;
  buttonDelete.textContent = "Deletar";
  buttonDelete.addEventListener("click", () => {
    const confirmDelete = confirm("Tem certeza que deseja excluir essa transação?");

    if (confirmDelete) {
      transaction.remove();
      deleteTransaction(transactionData.id);
    }
  });

  const divButtons = document.createElement("div");
  divButtons.classList.add("transaction-buttons");

  divTransactionType.appendChild(spanTransactionType);
  divDescription.appendChild(spanDescription);
  divValue.appendChild(spanValue);
  divButtons.append(buttonEdit, buttonDelete);

  transaction.append(divTransactionType, divDescription, divValue, divButtons);
  document.querySelector(".transactions").appendChild(transaction);
}

async function fetchTransactions() {
  const response = await fetch("http://localhost:3000/transactions").then(res => res.json());
  response.forEach(renderTransactions);
}

const form = document.querySelector("form");
form.addEventListener("submit", async ev => {
  ev.preventDefault();

  const transactionData = {
    description: document.querySelector("#description").value,
    value: document.querySelector("#value").value,
    opType: document.querySelector("select").value,
  };

  if (transactionData.opType === "saida") {
    transactionData.value *= -1;
  }

  console.log(transactionData);

  const response = await fetch("http://localhost:3000/transactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transactionData),
  });

  const savedTransaction = await response.json();

  form.reset();
  renderTransactions(savedTransaction);
  balanceUpdate();
});

async function editTransaction(id) {
  const transactionData = {
    description: document.querySelector("#newDesc").value,
    value: document.querySelector("#newValue").value,
    opType: document.querySelector("#newOpType").value,
  };

  if (transactionData.opType === "saida") {
    transactionData.value *= -1;
  }

  console.log(transactionData);

  const response = await fetch(`http://localhost:3000/transactions/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transactionData),
  });

  const savedTransaction = await response.json();
  renderTransactions(savedTransaction);
}

async function deleteTransaction(id) {
  const response = await fetch(`http://localhost:3000/transactions/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  renderTransactions;
  balanceUpdate();
}

async function balanceUpdate() {
  let sum = 0;
  const response = await fetch("http://localhost:3000/transactions").then(res => res.json());

  for (const item of response) {
    sum += parseFloat(item.value);
  }

  const balance = document.getElementById("balance");
  balance.textContent = sum.toFixed(2);
}

document.addEventListener("DOMContentLoaded", () => {
  fetchTransactions(renderTransactions);
  balanceUpdate();
});
