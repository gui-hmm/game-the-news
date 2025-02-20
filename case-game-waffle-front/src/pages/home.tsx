import MainLayout from "../layouts/mainLayout";
import Button from "../components/button";

const Home = () => {
  return (
    <MainLayout>
      <h2 className="text-2xl font-bold text-black">Bem-vindo ao Meu Sistema</h2>
      <p className="text-gray mt-2">Gerencie seus dados de maneira eficiente.</p>
      <Button label="Saiba mais" onClick={() => alert("Saiba mais!")} />
    </MainLayout>
  );
};

export default Home;
