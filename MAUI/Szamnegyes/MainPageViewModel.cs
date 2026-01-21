using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace Szamnegyes;

public partial class MainPageViewModel : ObservableObject
{
    #region Fields
    [ObservableProperty]
    private int firstRowOne = 0;

    [ObservableProperty]
    private int firstRowTwo = 0;

    [ObservableProperty]
    private int firstRowThree = 0;

    [ObservableProperty]
    private int secondRowOne = 0;

    [ObservableProperty]
    private int secondRowTwo = 0;

    [ObservableProperty]
    private int secondRowThree = 0;

    [ObservableProperty]
    private int thirdRowOne = 0;

    [ObservableProperty]
    private int thirdRowTwo = 0;

    [ObservableProperty]
    private int thirdRowThree = 0;
    #endregion

    [RelayCommand]
    private void RefreshTheTable()
    {
        FirstRowOne = 0;
        FirstRowTwo = 0;
        FirstRowThree = 0;

        SecondRowOne = 0;
        SecondRowTwo = 0;
        SecondRowThree = 0;

        ThirdRowOne = 0;
        ThirdRowTwo = 0;
        ThirdRowThree = 0;
    }

    [RelayCommand]
    private void IncreaseAFields()
    {
        FirstRowOne += 1;
        FirstRowTwo += 1;

        SecondRowOne += 1;
        SecondRowTwo += 1;
    }

    [RelayCommand]
    private void IncreaseBFields()
    {
        FirstRowTwo += 1;
        FirstRowThree += 1;

        SecondRowTwo += 1;
        SecondRowThree += 1;
    }

    [RelayCommand]
    private void IncreaseCFields()
    {
        SecondRowOne += 1;
        SecondRowTwo += 1;

        ThirdRowOne += 1;
        ThirdRowTwo += 1;
    }

    [RelayCommand]
    private void IncreaseDFields()
    {
        SecondRowTwo += 1;
        SecondRowThree += 1;

        ThirdRowTwo += 1;
        ThirdRowThree += 1;
    }
}