namespace Szamnegyes;

public partial class MainPage : ContentPage
{
    public MainPageViewModel ViewModel => BindingContext as MainPageViewModel;

    public MainPage(MainPageViewModel viewModel)
    {
        BindingContext = viewModel;
        InitializeComponent();
    }
}