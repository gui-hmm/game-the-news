import USerLayout from "../layouts/userLayout";
import Button from "../components/button";

const Home = () => {
  return (
    <USerLayout>
      <h2 className="text-2xl font-bold text-black">Bem-vindo ao Meu Sistema</h2>
      <p className="text-gray mt-2">Gerencie seus dados de maneira eficiente.</p>
      <Button label="Saiba mais" onClick={() => alert("Saiba mais!")} />
    </USerLayout>
  );
};

export default Home;
